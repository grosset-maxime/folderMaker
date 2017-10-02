folderMaker
===========

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
