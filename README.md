folderMaker
===========

## Install

In `C:\windows\System32\drivers\etc\hosts`, add:
```
127.0.0.1 foldermaker.local
```

Create symbolic links (with a `Command prompt`):
```
cd C:\web\folderMaker\api\vendors
MKLINK /D PM C:\web\PM\api

cd C:\web\folderMaker\public\js\vendors
MKLINK /D PM C:\web\PM\public\js

cd C:\web\folderMaker\public\css\vendors
MKLINK /D PM C:\web\PM\public\css
```


## Mise en prod:

```
cd /var/services/web/folderMaker/

git fetch origin

git reset --hard origin/master
```

## Restart nginx

```
synoservicecfg --restart nginx
```
