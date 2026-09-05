---
title: "ANSSL.CN 新手教程：Linux 上从申请 SSL 证书到 Nginx / Apache 部署"
date: 2026-09-05
description: "面向第一次部署 HTTPS 的用户，从阿里云/腾讯云域名解析、ANSSL.CN 申请证书、CNAME 验证，到 Linux Nginx 或 Apache 安装证书，一步一步完成网站 HTTPS。"
tags:
  - ANSSL
  - SSL
  - HTTPS
  - Linux
  - Nginx
  - Apache
  - 阿里云
  - 腾讯云
---

![ANSSL.CN Linux SSL 新手教程]({{ "/assets/image/00-cover.png" | relative_url }})

> 第一次给网站安装 SSL 证书，最容易卡住的地方通常不是 Linux 命令，而是不知道“域名解析、证书验证、证书文件、Nginx/Apache 配置”之间到底是什么关系。
>
> 本文不要求你先理解一堆 SSL 专业术语。只要你有一个域名、一台能通过公网访问的 Linux 服务器，并且网站使用 Nginx 或 Apache，按顺序操作即可。
>
> 本文以 `example.com` 为示例域名，以 `203.0.113.10` 为示例服务器 IP。**请务必替换成你自己的域名和服务器公网 IP，不要直接照抄示例值。**

---

# 一、先弄明白：我们到底要做什么？

最终目标很简单：

```text
http://example.com
        ↓
安装 SSL 证书
        ↓
https://example.com
```

整个过程可以拆成 7 步：

![从申请到部署的完整流程]({{ "/assets/image/01-flow.png" | relative_url }})

1. 把域名解析到你的 Linux 服务器；
2. 在 ANSSL.CN 申请 SSL 证书；
3. 按 ANSSL 页面提示添加 CNAME 验证记录；
4. 等待证书签发；
5. 下载证书并上传到 Linux；
6. 配置 Nginx 或 Apache；
7. 用浏览器确认 HTTPS 已经正常工作。

如果你的网站已经可以通过：

```text
http://你的域名
```

正常打开，那么第一步通常已经完成，可以直接从“申请证书”开始。

> 本文适合“域名直接访问 Linux 服务器”的普通网站。如果你的域名正在使用腾讯云 EdgeOne、阿里云 ESA、CDN、DCDN、负载均衡等云产品，不要随意把现有 CNAME 改成服务器 IP，应使用对应云产品的证书部署方式。

---

# 二、开始前准备好这 4 样东西

## 1. 一个已经注册的域名

例如：

```text
example.com
```

域名在哪里买并不重要，常见的有：

- 阿里云；
- 腾讯云；
- 西部数码；
- 华为云；
- Cloudflare；
- 其他域名注册商或 DNS 服务商。

本文重点演示国内比较常见的：

```text
阿里云 云解析 DNS
腾讯云 DNSPod
```

## 2. 一台 Linux 服务器

常见系统都可以，例如：

```text
Ubuntu
Debian
Rocky Linux
AlmaLinux
CentOS
```

你需要知道服务器的公网 IP，例如：

```text
203.0.113.10
```

## 3. 网站已经使用 Nginx 或 Apache

先登录服务器，然后执行：

```bash
nginx -v
```

如果能看到 Nginx 版本，说明已经安装 Nginx。

Apache 可以执行：

```bash
apache2 -v
```

或者：

```bash
httpd -v
```

> 一台普通网站服务器通常只需要 Nginx 或 Apache 其中一个。新手不要让两个程序同时抢占 80 和 443 端口。

## 4. 云服务器安全组允许 80 和 443 端口

无论你使用阿里云 ECS、腾讯云 CVM，还是其他云服务器，都要确认入站规则至少允许：

| 端口 | 协议 | 用途 |
| --- | --- | --- |
| 80 | TCP | 普通 HTTP 网站访问 |
| 443 | TCP | HTTPS 网站访问 |

对于公开网站，80 和 443 通常需要允许公网用户访问。

如果 443 没开放，即使证书和 Nginx 配置全部正确，浏览器仍然会连接超时。

---

# 三、先让域名能够访问你的服务器

如果你的域名已经可以通过 HTTP 正常打开网站，这一节可以跳过。

假设：

```text
域名：example.com
服务器公网 IP：203.0.113.10
```

最简单的解析方式是：

| 主机记录 | 类型 | 记录值 |
| --- | --- | --- |
| `@` | A | `203.0.113.10` |
| `www` | A | `203.0.113.10` |

这样：

```text
example.com
www.example.com
```

都会访问这台服务器。

## 阿里云怎么添加 A 记录？

进入：

```text
阿里云控制台
→ 云解析 DNS
→ 公网权威解析
→ 找到你的域名
→ 解析设置
→ 添加记录
```

如果要解析主域名 `example.com`：

```text
记录类型：A
主机记录：@
解析请求来源：默认
记录值：你的服务器公网 IP
TTL：保持默认即可
```

如果还要使用 `www.example.com`，再添加一条：

```text
记录类型：A
主机记录：www
记录值：你的服务器公网 IP
```

## 腾讯云怎么添加 A 记录？

进入：

```text
腾讯云控制台
→ 云解析 DNS
→ 权威解析
→ 找到你的域名
→ 添加记录
```

主域名：

```text
记录类型：A
主机记录：@
线路类型：默认
记录值：你的服务器公网 IP
TTL：保持默认即可
```

`www` 域名：

```text
记录类型：A
主机记录：www
线路类型：默认
记录值：你的服务器公网 IP
```

保存以后不要着急，DNS 解析需要一点时间生效。

可以在自己的电脑上测试：

```bash
nslookup example.com
```

如果结果已经能看到你的服务器公网 IP，说明最基本的域名解析完成了。

---

# 四、在 ANSSL.CN 申请 SSL 证书

打开 ANSSL.CN 控制台并登录，然后进入：

```text
证书管理
→ 申请证书 / 新建证书
```

当前 ANSSL 的申请流程会依次完成：

```text
域名配置
→ 证书选项
→ 部署配置
→ 申请进度
```

## 1. 填写你要保护的域名

如果你的网站同时使用：

```text
example.com
www.example.com
```

建议证书同时包含这两个域名。

在域名输入区域中按页面要求填写，例如：

```text
example.com
www.example.com
```

如果你只填写：

```text
example.com
```

那么以后访问：

```text
https://www.example.com
```

有可能出现证书域名不匹配。

## 2. 验证方式选择 DNS-01

对于第一次操作的用户，本文建议使用：

```text
DNS-01
```

ANSSL 当前的 DNS-01 使用 **CNAME 验证**。

这里不用记住“DNS-01”是什么意思，你只需要理解成：

> ANSSL 会给你一条需要添加到域名解析里的 CNAME 记录。你能成功添加这条记录，就证明这个域名确实由你管理。

DNS-01 特别适合：

- 普通域名；
- 多域名证书；
- 通配符证书；
- 希望以后续订更稳定的场景。

通配符证书，例如：

```text
*.example.com
```

必须使用 DNS-01。

## 3. CA 和算法怎么选？

ANSSL 当前支持多家证书颁发机构。对于第一次申请的用户，如果没有特殊兼容性要求，**保持页面默认推荐选项即可**。

算法同样不需要一开始研究太深。

如果你确定自己的用户设备比较新，可以使用页面推荐算法；如果网站需要兼容非常老的系统，可以再考虑 RSA。

## 4. 部署配置可以先跳过

第一次操作时，建议先把证书成功申请下来，再手动部署一次。

这样以后出现问题时，你至少知道：

```text
证书文件放在哪里
Nginx / Apache 从哪里读取证书
```

熟悉以后，再开启 ANSSL 自动部署。

---

# 五、最关键的一步：添加 ANSSL 给出的 CNAME 验证记录

提交申请以后，ANSSL 会在申请进度中显示需要添加的 CNAME 记录。

你可能会看到类似这样的信息：

```text
记录类型：CNAME
主机记录：_acme-challenge
记录值：某个由 ANSSL 页面给出的目标域名
```

这里最重要的一句话是：

> **主机记录和记录值都以 ANSSL 当前申请页面实际显示的内容为准。下面所有内容都只是演示填写方法，不是让你照抄示例值。**

如果 ANSSL 显示多条验证记录，就全部添加，不要只添加第一条。

![阿里云和腾讯云 CNAME 验证填写示意]({{ "/assets/image/02-dns-cname.png" | relative_url }})

---

## 六、阿里云：添加 ANSSL 的 CNAME 验证记录

进入：

```text
阿里云控制台
→ 云解析 DNS
→ 公网权威解析
→ 选择你的域名
→ 添加记录
```

按照 ANSSL 页面显示的信息填写。

常见形式如下：

```text
记录类型：CNAME
主机记录：_acme-challenge
解析请求来源：默认
TTL：10 分钟或保持默认
记录值：复制 ANSSL 页面显示的 CNAME 目标域名
```

### 最容易填错的是“主机记录”

假设你的域名是：

```text
example.com
```

ANSSL 显示需要验证：

```text
_acme-challenge.example.com
```

在阿里云“主机记录”位置，一般填写的是：

```text
_acme-challenge
```

而不是再次填写完整的：

```text
_acme-challenge.example.com
```

因为阿里云会自动把主机记录和你的主域名拼接起来。

### 记录值不要加 `https://`

如果 ANSSL 页面给出的目标是一个域名，就原样复制这个域名。

不要写成：

```text
https://目标域名/
```

CNAME 的记录值不是网址，不需要协议和路径。

保存以后回到 ANSSL，刷新验证状态。

---

# 七、腾讯云 DNSPod：添加 ANSSL 的 CNAME 验证记录

进入：

```text
腾讯云控制台
→ 云解析 DNS
→ 权威解析
→ 选择你的域名
→ 添加记录
```

常见填写方式：

```text
记录类型：CNAME
主机记录：_acme-challenge
线路类型：默认
TTL：600 秒或保持默认
记录值：复制 ANSSL 页面显示的 CNAME 目标域名
```

腾讯云现在提供行内模式和弹窗模式。

如果你第一次操作 DNS，建议使用弹窗模式，字段说明更清楚。

同样注意：

```text
不要自己把 CNAME 改成 TXT
不要在记录值前加 https://
不要凭感觉修改 ANSSL 给出的主机记录
```

保存以后回到 ANSSL，刷新验证状态。

---

# 八、CNAME 保存了，为什么 ANSSL 还显示“未验证”？

这是新手最常见的问题之一。

DNS 记录不是保存后全球所有地方立即同步。

先等待几分钟，然后在电脑或服务器上查询：

```bash
nslookup -type=CNAME _acme-challenge.example.com
```

Linux 如果安装了 `dig`，也可以：

```bash
dig CNAME _acme-challenge.example.com +short
```

如果能看到 ANSSL 要求的 CNAME 目标，说明解析已经基本生效。

然后再回 ANSSL 刷新验证状态。

## 如果仍然验证失败，依次检查

1. 记录类型是不是 `CNAME`；
2. 主机记录有没有多写一遍主域名；
3. 记录值有没有多加 `https://`；
4. ANSSL 显示几条验证记录，你是否全部添加；
5. `_acme-challenge` 这个名字下面是否已经存在冲突的 CNAME/A/TXT 等记录；
6. 域名当前真正使用的 DNS 服务商是不是你正在修改的这一家。

最后一项很容易忽略。

例如域名虽然是在阿里云购买的，但 DNS 服务器已经改成腾讯云 DNSPod，那么你在阿里云修改解析并不会生效。

---

# 九、等待 ANSSL 签发证书

CNAME 验证通过后，ANSSL 会继续向 CA 申请证书。

正常情况下不需要再操作服务器。

证书成功以后，在证书列表或证书详情中下载 ZIP 包。

ANSSL 的证书下载包通常会包含：

```text
网站证书
私钥
中间证书 / 完整证书链
```

我们接下来真正需要的主要是：

```text
完整证书链（fullchain）
私钥（private key）
```

为了后面的配置更容易理解，本文统一把它们整理成：

```text
fullchain.pem
private.key
```

> 文件名不一定和 ANSSL 下载包完全相同。重点是认准“完整证书链”和“私钥”，不要只看扩展名猜测。

---

# 十、把证书上传到 Linux 服务器

本文统一把证书放在：

```text
/etc/ssl/anssl/example.com/
```

这样以后不会到处找文件。

![Linux 证书文件目录与 Nginx Apache 的关系]({{ "/assets/image/03-server-files.png" | relative_url }})

## 1. 先创建目录

登录服务器执行：

```bash
mkdir -p /etc/ssl/anssl/example.com
```

## 2. 从电脑上传证书

如果你的电脑可以使用 `scp`，可以在自己的电脑上执行：

```bash
scp fullchain.pem private.key root@你的服务器IP:/root/
```

例如：

```bash
scp fullchain.pem private.key root@203.0.113.10:/root/
```

如果你不熟悉命令行，也可以使用 WinSCP、Xftp 等 SFTP 工具，把两个文件上传到服务器的 `/root/` 目录。

## 3. 把证书放到专用目录

在服务器执行：

```bash
cp /root/fullchain.pem /etc/ssl/anssl/example.com/fullchain.pem
cp /root/private.key /etc/ssl/anssl/example.com/private.key
```

设置权限：

```bash
chown -R root:root /etc/ssl/anssl/example.com
chmod 644 /etc/ssl/anssl/example.com/fullchain.pem
chmod 600 /etc/ssl/anssl/example.com/private.key
```

这里的 `private.key` 是私钥。

私钥不要：

- 发到群里；
- 放到公开网盘；
- 提交到 GitHub；
- 截图发给别人；
- 直接贴到公开工单。

## 如果下载包里没有 `fullchain.pem` 怎么办？

如果只有：

```text
certificate.pem
chain.pem
```

可以按照“网站证书在前、证书链在后”的顺序合并：

```bash
cat certificate.pem chain.pem > fullchain.pem
```

然后再把生成的 `fullchain.pem` 放到：

```text
/etc/ssl/anssl/example.com/fullchain.pem
```

如果下载包本身已经提供完整证书链，则不需要重复合并。

---

# 十一、Nginx 部署教程

如果你使用的是 Apache，请跳到后面的 Apache 部分。

## 1. 如果还没安装 Nginx

Debian / Ubuntu：

```bash
apt update
apt install -y nginx
systemctl enable --now nginx
```

Rocky Linux / AlmaLinux：

```bash
dnf install -y nginx
systemctl enable --now nginx
```

先检查状态：

```bash
systemctl status nginx
```

看到服务处于运行状态即可。

## 2. 找到你的网站配置文件

Debian / Ubuntu 常见位置：

```text
/etc/nginx/sites-available/
/etc/nginx/sites-enabled/
```

Rocky / AlmaLinux 常见位置：

```text
/etc/nginx/conf.d/
```

如果你的网站现在已经能通过 HTTP 正常访问，**不要随便删除原来的配置**。

先找出哪个配置文件包含你的域名：

```bash
grep -R "server_name.*example.com" /etc/nginx 2>/dev/null
```

把 `example.com` 换成你的域名。

## 3. 新网站的最简单 Nginx HTTPS 示例

以 Debian / Ubuntu 为例，新建：

```bash
nano /etc/nginx/sites-available/example.com
```

写入：

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name example.com www.example.com;

    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;

    server_name example.com www.example.com;

    root /var/www/html;
    index index.html index.htm;

    ssl_certificate     /etc/ssl/anssl/example.com/fullchain.pem;
    ssl_certificate_key /etc/ssl/anssl/example.com/private.key;

    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

然后启用：

```bash
ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/example.com
```

如果链接已经存在，系统会提示文件已存在，这时不要重复创建。

> 如果你的网站是 PHP、WordPress、反向代理、Node.js、Java 等项目，不要直接用上面的 `location /` 覆盖原配置。保留你当前网站的 `root`、`location`、`proxy_pass`、PHP 配置，只增加 443、证书路径和 HTTP 跳转即可。

## 4. 修改后不要直接重启，先检查配置

执行：

```bash
nginx -t
```

如果看到类似：

```text
syntax is ok
test is successful
```

再执行：

```bash
systemctl reload nginx
```

为什么推荐 `reload`？

因为它会重新读取配置，通常比直接停止再启动服务更平滑。

## 5. 确认 443 已经监听

执行：

```bash
ss -lntp | grep ':443'
```

如果能看到 Nginx 正在监听 443，说明 HTTPS 服务已经启动。

---

# 十二、Apache 部署教程

如果你使用 Nginx，这一部分不用操作。

Apache 在不同 Linux 发行版上的名字略有区别：

```text
Debian / Ubuntu：apache2
Rocky / AlmaLinux：httpd
```

## 1. Debian / Ubuntu 安装或确认 Apache SSL 模块

如果 Apache 还没安装：

```bash
apt update
apt install -y apache2
systemctl enable --now apache2
```

启用 SSL 模块：

```bash
a2enmod ssl
```

## 2. 创建网站配置

新建：

```bash
nano /etc/apache2/sites-available/example.com.conf
```

写入：

```apache
<VirtualHost *:80>
    ServerName example.com
    ServerAlias www.example.com

    Redirect permanent / https://example.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName example.com
    ServerAlias www.example.com

    DocumentRoot /var/www/html

    SSLEngine on
    SSLCertificateFile /etc/ssl/anssl/example.com/fullchain.pem
    SSLCertificateKeyFile /etc/ssl/anssl/example.com/private.key

    <Directory /var/www/html>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

启用站点：

```bash
a2ensite example.com.conf
```

## 3. 先检查，再重载

执行：

```bash
apache2ctl configtest
```

如果看到：

```text
Syntax OK
```

再执行：

```bash
systemctl reload apache2
```

## 4. Rocky / AlmaLinux 怎么办？

安装：

```bash
dnf install -y httpd mod_ssl
systemctl enable --now httpd
```

网站配置通常放在：

```text
/etc/httpd/conf.d/example.com.conf
```

配置内容仍然使用前面的 `<VirtualHost>` 写法。

检查配置：

```bash
apachectl configtest
```

重载：

```bash
systemctl reload httpd
```

---

# 十三、Linux 自己还有防火墙怎么办？

云服务器有“安全组”，Linux 自己还可能有一层防火墙。

## Ubuntu / Debian 使用 UFW 时

先看状态：

```bash
ufw status
```

如果显示 `active`，可以放行：

```bash
ufw allow 80/tcp
ufw allow 443/tcp
```

## Rocky / AlmaLinux 使用 firewalld 时

查看状态：

```bash
systemctl status firewalld
```

如果正在运行：

```bash
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
```

如果你没有启用这些防火墙，不需要为了照教程而额外开启。

---

# 十四、现在检查 HTTPS 是否真的成功

## 方法一：直接用浏览器

访问：

```text
https://example.com
```

然后再访问：

```text
https://www.example.com
```

确认：

- 页面能够正常打开；
- 浏览器没有证书警告；
- 证书域名与你访问的域名一致；
- HTTP 地址能够自动跳转到 HTTPS。

## 方法二：使用 curl

在服务器或自己的电脑执行：

```bash
curl -I https://example.com
```

能够正常返回 HTTP 响应头，就说明 HTTPS 已经可以建立连接。

## 方法三：用 OpenSSL 查看证书

```bash
openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates
```

可以看到：

```text
证书颁发给谁
由谁签发
什么时候生效
什么时候到期
```

---

# 十五、最常见的 7 个错误

## 1. ANSSL 一直提示 CNAME 未验证

检查：

```bash
nslookup -type=CNAME _acme-challenge.example.com
```

如果查不到，说明 DNS 还没生效、填错了，或者你修改的不是当前权威 DNS。

## 2. 添加 CNAME 时提示记录冲突

说明同一个主机记录下面可能已经有其他冲突记录。

不要直接删除看不懂的生产记录。

先确认：

```text
这个旧记录是谁创建的？
是否还在使用？
是否和以前的 SSL 验证有关？
```

确认后再处理。

## 3. `nginx -t` 提示找不到证书文件

例如：

```text
No such file or directory
```

先检查：

```bash
ls -l /etc/ssl/anssl/example.com/
```

确认确实存在：

```text
fullchain.pem
private.key
```

再检查 Nginx 配置里的路径有没有写错。

## 4. Nginx / Apache 提示私钥不匹配

通常意味着：

```text
你上传的证书
和
你上传的 private.key
```

不是同一张证书对应的一对文件。

重新从同一份 ANSSL 下载包中取出证书和私钥，不要把不同证书的文件混在一起。

## 5. 浏览器访问 443 一直超时

按顺序检查：

```text
云服务器安全组 443
→ Linux 防火墙 443
→ Nginx / Apache 是否正在运行
→ 443 是否正在监听
```

检查监听：

```bash
ss -lntp | grep ':443'
```

## 6. `https://example.com` 正常，`https://www.example.com` 报错

通常有两个原因：

1. 证书里没有包含 `www.example.com`；
2. Nginx / Apache 配置没有把 `www.example.com` 加入站点。

因此申请前就应确认实际会使用哪些域名。

## 7. 浏览器有 HTTPS，但页面里还有“不安全内容”

这通常不是证书本身的问题，而是网页里还有图片、JS、CSS 使用：

```text
http://
```

把这些资源地址改成 HTTPS 即可。

---

# 十六、证书成功以后，CNAME 验证记录要不要删？

对于 ANSSL 的 DNS-01 / CNAME 验证，**不要为了“解析列表看起来干净”就马上删除验证记录**。

因为这种验证方式本身就是为了让后续续订更加稳定。

如果 ANSSL 当前页面提示该记录用于后续续订或验证，应继续保留。

只要记录值是 ANSSL 当前申请流程要求的验证目标，就不影响你网站正常解析到服务器。

网站真正访问使用的是：

```text
example.com
www.example.com
```

证书验证使用的是类似：

```text
_acme-challenge.example.com
```

它们不是同一个地址。

---

# 十七、第一次手动部署成功后，建议开启 ANSSL 自动部署

如果你只部署一次，到这里已经结束。

但 SSL 证书不是永久有效的。以后证书续订成功，还要把新证书重新放到服务器并让 Nginx / Apache 重新加载。

长期手动操作很容易忘。

ANSSL 当前提供 deploy 客户端，可把已经签发或续订的证书自动同步到 Linux 本机的：

```text
Nginx
Apache
```

而且本地服务部署不需要为了 ANSSL 对外开放 SSH。

大致流程是：

```text
ANSSL 配置生成器
        ↓
生成 config.yaml 和安装命令
        ↓
在 Linux 安装 deploy 客户端
        ↓
客户端在“自动部署”页面上线
        ↓
绑定证书
        ↓
选择 Nginx 或 Apache 作为部署目标
        ↓
测试连接
        ↓
开启自动部署
```

如果你已经通过本文手动部署成功，再配置自动部署会容易理解很多。

ANSSL 自动部署文档：

```text
https://docs.anssl.cn/guides/deploy
```

---

# 十八、完整流程再看一遍

第一次部署 HTTPS，可以只记住下面这条线：

```text
准备域名
   ↓
域名 A 记录指向 Linux 公网 IP
   ↓
ANSSL.CN 申请证书
   ↓
选择 DNS-01
   ↓
到阿里云 / 腾讯云添加 ANSSL 给出的 CNAME
   ↓
返回 ANSSL 等待验证和签发
   ↓
下载证书 ZIP
   ↓
整理出 fullchain.pem + private.key
   ↓
上传到 /etc/ssl/anssl/你的域名/
   ↓
Nginx 或 Apache 配置 443
   ↓
先做配置检查
   ↓
reload Web 服务
   ↓
访问 https://你的域名
   ↓
完成
```

如果中间失败，不要把所有配置推倒重来。

先判断你卡在哪一层：

```text
域名解析？
CNAME 验证？
证书签发？
文件上传？
Nginx / Apache 配置？
443 端口？
```

一层一层排查，通常很快就能找到问题。

---

# 十九、参考资料

本文操作方式结合 ANSSL 当前文档，以及阿里云、腾讯云官方 DNS 文档整理。

- [ANSSL.CN 证书管理](https://docs.anssl.cn/guides/certificate-management/)
- [ANSSL.CN 自动部署](https://docs.anssl.cn/guides/deploy)
- [ANSSL.CN 快速开始](https://docs.anssl.cn/starteds/started)
- [阿里云：公网权威解析添加解析记录](https://help.aliyun.com/zh/dns/pubz-add-parsing-record)
- [腾讯云 DNSPod：CNAME 记录](https://cloud.tencent.com/document/product/302/3450)
- [腾讯云 DNSPod：A 记录](https://cloud.tencent.com/document/product/302/3449)

> 本文以 ANSSL.CN 当前页面和文档为准。云厂商控制台的按钮名称和页面布局可能会调整，但核心填写项不会因此改变：记录类型、主机记录、线路/来源、TTL、记录值。
