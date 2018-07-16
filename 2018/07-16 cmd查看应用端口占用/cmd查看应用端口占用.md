# windows查看端口占用

```bash
netstat -ano | findstr "1080"   //查看1080端口应用的进程id
tasklist | findstr "12652"  //查看12652进程的名字
```