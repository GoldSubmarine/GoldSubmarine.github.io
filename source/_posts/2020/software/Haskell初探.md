---
title: Haskell 初探
date: 2020-03-09 03:18:00
tags: Haskell
categories: 软件技术
---

只讲特性，不讲语法

## 惰性求值

```haskell
take 4 [13,26..]
-- [13, 26, 39, 52]
```

从步长为 13 的无限数组中取出前 4 位，可以出现无限数组，因为定义的时候并没有计算，而是调用的时候，前面写了 4 ，于是计算到第 44 个数时，就停止计算了

java 的 Stream 中的所有环节都是惰性的，本质只循环了一次

## 声明式编程

Haskell 中的 `List Comprehension`

如何取得所有三边长度皆为整数且小于等于 10，周长为 24 的直角三角形？

首先，把所有三遍长度小于等于 10 的三角形都列出来：

```haskell
ghci> let triangles = [ (a,b,c) | c <- [1..10], b <- [1..10], a <- [1..10] ]
```

上述代码从三个 List 中取值，并组合为一个三元组。接下来开始过滤这些三元组，增加限制条件：直角三角形，同时也考虑上 b 边要短于斜边，a 边要短于 b 边情况

```haskell
ghci> let rightTriangles = [ (a,b,c) | c <- [1..10], b <- [1..c], a <- [1..b], a^2 + b^2 == c^2]
```

最后告诉它只要周长为 24 的三角形

```haskell
ghci> let rightTriangles = [ (a,b,c) | c <- [1..10], b <- [1..c], a <- [1..b], a^2 + b^2 == c^2, a+b+c == 24]
ghci> rightTriangles
[(6,8,10)]
```

在命令式语言中，有控制流程，随着命令的执行，状态就会随之发生改变。

然而在函数式编程语言中，你不是像命令式语言那样命令电脑“要做什么”，而是通过用函数来描述出问题“是什么”

## 元组

元组的使用表示二维向量，[[1,2],[8,1,15],[4,5]]，尽管数组可可以表示，但是可能会产生三个数据，而元组能固定一个数据结构。

java 中有封装好的 Pair 和 Tuple，但是不能只是把它当作一个封装类去使用它，而要把它看作一种基本概念，就像枚举一样。

## 一切皆函数

Haskell 有一个中辍函数的概念

```haskell
-- 判断4是否在集合中
ghci> 4 `elem` [3,4,5,6]
True
```

`elem` 就是一个中辍函数

```haskell
ghci> 1 + 1
2
ghci> :t (+)
(+) :: Num a => a -> a -> a
```

加法本质上也是一个函数，通过 `:t` 可以查看它的类型约束，可以看到本质就是一个加法函数

## 模式匹配

```haskell
sayMe :: (Integral a) => a -> String
sayMe 1 = "One!"
sayMe 2 = "Two!"
sayMe 3 = "Three!"
sayMe 4 = "Four!"
sayMe 5 = "Five!"
sayMe x = "Not between 1 and 5"
```

sayMe 是一个函数，当调用 `sayMe 2` 时返回 "Two!"，当调用 `sayMe 12` 时返回 "Not between 1 and 5"，要是没有模式匹配的话，那可得好大一棵 if-else 树了！

```haskell
factorial :: (Integral a) => a -> a
factorial 0 = 1
factorial n = n * factorial (n - 1)
```

从上述代码可以看到，可以将模式匹配和递归配合起来，实现阶乘阶

## 门卫

```haskell
bmiTell :: (RealFloat a) => a -> a -> String
bmiTell weight height
    | bmi <= skinny = "You're underweight, you emo, you!"
    | bmi <= normal = "You're supposedly normal. Pffft, I bet you're ugly!"
    | bmi <= fat    = "You're fat! Lose some weight, fatty!"
    | otherwise     = "You're a whale, congratulations!"
    where bmi = weight / height ^ 2
          skinny = 18.5
          normal = 25.0
          fat = 30.0
```

通过 `|` 表示 if else，where 中定义的变量对所有门卫都可见，也可以在每个门卫内用 let 定义变量，只对门卫可见。

## 柯里函数

Haskell 中所有的函数都是柯里函数，只有一个参数

```haskell
ghci> max 4 5
5
ghci> (max 4) 5
5
ghci> let cacheMax = max 4
ghci> cacheMax 5
5
```

max 函数的类型为 `max :: (Ord a) => a -> a -> a` ，也可以写作 `max :: (Ord a) => a -> (a -> a)`，而不是 `max :: (a, a) => a`

柯里化和协程的区别：协程调用时需要一次性提供全部的入参，执行时可停顿，而柯里化不仅能实现执行的暂停，更重要的是函数可以方便的组合。

下面是一些示例：

```haskell
divideByTen :: (Floating a) => a -> a
divideByTen = (/10)
```

```haskell
-- 首字母是否大写
isUpperAlphanum :: Char -> Bool
isUpperAlphanum = (`elem` ['A'..'Z'])
```

## 高阶函数

封装一个 zipWith 功能

```haskell
zipWith' :: (a -> b -> c) -> [a] -> [b] -> [c]
zipWith' _ [] _ = []
zipWith' _ _ [] = []
zipWith' f (x:xs) (y:ys) = f x y : zipWith' f xs ys
-- f为传入的函数，第二个和三个参数为list，x和y分别表示两个list的第一个元素
```

```haskell
ghci> zipWith' (+) [4,2,5,6] [2,6,2,3]
[6,8,7,9]
ghci> zipWith' max [6,3,2,1] [7,3,1,5]
[7,3,2,5]
ghci> zipWith' (++) ["foo "，"bar "，"baz "] ["fighters"，"hoppers"，"aldrin"]
["foo fighters","bar hoppers","baz aldrin"]
ghci> zipWith' (*) (replicate 5 2) [1..]
[2,4,6,8,10]
ghci> zipWith' (zipWith' (*)) [[1,2,3],[3,5,6],[2,3,4]] [[3,2,2],[3,4,5],[5,4,3]]
[[3,4,6],[9,20,30],[10,12,12]]
```

一些其他的常用函数

### map

```haskell
map :: (a -> b) -> [a] -> [b]
map _ [] = []
map f (x:xs) = f x : map f xs
```

```haskell
ghci> map (+3) [1,5,3,1,6]
[4,8,6,4,9]
ghci> map (++ "!") ["BIFF"，"BANG"，"POW"]
["BIFF!","BANG!","POW!"]
ghci> map (replicate 3) [3..6]
[[3,3,3],[4,4,4],[5,5,5],[6,6,6]]
ghci> map (map (^2)) [[1,2],[3,4,5,6],[7,8]]
[[1,4],[9,16,25,36],[49,64]]
ghci> map fst [(1,2),(3,5),(6,3),(2,6),(2,5)]
[1,3,6,2,2]
```

你可能会发现，以上的所有代码都可以用 List Comprehension 来替代。`map (+3) [1,5,3,1,6]` 与 `[x+3 | x <- [1,5,3,1,6]` 完全等价。

### filter

```haskell
filter :: (a -> Bool) -> [a] -> [a]
filter _ [] = []
filter p (x:xs)
    | p x       = x : filter p xs
    | otherwise = filter p xs
```

```haskell
ghci> filter (>3) [1,5,3,2,1,6,4,3,2,1]
[5,6,4]
ghci> filter (==3) [1,2,3,4,5]
[3]
ghci> filter even [1..10]
[2,4,6,8,10]
ghci> let notNull x = not (null x) in filter notNull [[1,2,3],[],[3,4,5],[2,2],[],[],[]]
[[1,2,3],[3,4,5],[2,2]]
ghci> filter (`elem` ['a'..'z']) "u LaUgH aT mE BeCaUsE I aM diFfeRent"
"uagameasadifeent"
ghci> filter (`elem` ['A'..'Z']) "i lauGh At You BecAuse u r aLL the Same"
"GAYBALLS"
```

## lambda

lambda 就是匿名函数。有些时候我们需要传给高阶函数一个函数，而这函数我们只会用这一次，这就弄个特定功能的 lambda。编写 lambda，就写个 \

```haskell
ghci> zipWith (\a b -> (a * 30 + 3) / b) [5,4,3,2,1] [1,2,3,4,5]
[153.0,61.5,31.0,15.75,6.6]
```

由于有柯里化，如下的两段是等价的：

```haskell
addThree :: (Num a) => a -> a -> a -> a
addThree x y z = x + y + z
```

```haskell
addThree :: (Num a) => a -> a -> a -> a
addThree = \x -> \y -> \z -> x + y + z
-- 等于号可以看作返回值,类似js中的=>,或java中的->
```

当然第一段代码更易读，不过第二个函数使得柯里化更容易理解。
