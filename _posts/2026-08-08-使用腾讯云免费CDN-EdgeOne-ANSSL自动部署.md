# ANSSL.CN 自动部署 SSL 证书到腾讯云 EdgeOne：同时支持 EO CDN 与 Makers

> 本文记录 ANSSL.CN 在证书签发或续期后，自动将 SSL 证书上传到腾讯云，并部署到 EdgeOne 域名的实际方案。  
> 本文只讨论 **ANSSL.CN → 腾讯云 SSL → EdgeOne** 这一条链路，不涉及 Nginx、源站证书替换或其他证书部署项目。  
> 以下配置和流程基于 2026 年 8 月的实际使用情况。

---

## 一、实现目标

ANSSL.CN 在证书签发或续期完成后，可以自动完成下面两件事情：

```text
ANSSL.CN 获得新证书
        │
        ▼
上传到腾讯云 SSL 证书服务
        │
        ▼
获得腾讯云 CertificateId
        │
        ▼
根据配置中的 domain + zoneId
        │
        ▼
部署到腾讯云 EdgeOne
        │
        ├── 普通 EO CDN 域名
        │
        └── EdgeOne Makers 自定义域名
```

实际使用时，EO CDN 和 Makers 不需要拆成两套不同的配置。

在 ANSSL.CN 中统一放到：

```yaml
edgeOne:
```

下面即可。

---

# 二、ANSSL.CN 的 EdgeOne 配置

实际配置示例：

```yaml
edgeOne:
  - label: "EO CDN"
    domain: fa.anssl.cn
    zoneId: zone-cvbgf6ygg9

  - label: "marks测试"
    domain: blog.anssl.cn
    zoneId: zone-1232t567x02
```

这一段配置可以同时放多个 EdgeOne 目标。

字段含义如下：

| 字段 | 作用 |
|---|---|
| `label` | 给自己看的名称，用于区分部署目标 |
| `domain` | 实际需要部署 SSL 证书的 EdgeOne 域名 |
| `zoneId` | 该域名所属的腾讯云 EdgeOne 站点 ID |

其中：

```yaml
label:
```

只是备注名称。

真正参与 EdgeOne API 调用的是：

```yaml
domain:
zoneId:
```

因此无论这个目标是普通的 EO CDN，还是 EdgeOne Makers 中绑定的自定义域名，只要已经取得对应的：

```text
domain
+
zoneId
```

就可以加入同一个 `edgeOne` 列表。

---

# 三、为什么配置里必须有 `zoneId`

腾讯云 EdgeOne 的“配置域名证书”API 是：

```text
ModifyHostsCertificate
```

API Endpoint：

```text
teo.tencentcloudapi.com
```

该接口在给一个 EdgeOne 域名更换自有 SSL 证书时，需要三个核心信息：

```text
ZoneId
Hosts
CertId
```

它们与 ANSSL.CN 配置的对应关系是：

```text
ANSSL.CN                   腾讯云 EdgeOne API

zoneId       ───────────→  ZoneId

domain       ───────────→  Hosts[]

腾讯云上传证书后得到的
CertificateId ──────────→  ServerCertInfo[].CertId
```

所以：

```yaml
edgeOne:
  - domain: fa.anssl.cn
    zoneId: zone-cvbgf6ygg9
```

并不是单纯为了做标记。

`zoneId` 是 EdgeOne API 真正需要的参数。

---

# 四、完整自动部署流程

整个过程可以拆成两个阶段。

## 第一阶段：把新证书上传到腾讯云 SSL

ANSSL.CN 完成证书签发或续期以后，已经拥有：

```text
证书公钥 / 完整证书链
私钥
```

随后调用腾讯云 SSL API：

```text
UploadCertificate
```

Endpoint：

```text
ssl.tencentcloudapi.com
```

主要提交：

```text
CertificatePublicKey
CertificatePrivateKey
CertificateType = SVR
```

成功后腾讯云会返回：

```text
CertificateId
```

例如：

```text
J2JqATrt
```

这个 `CertificateId` 就是下一步 EdgeOne 更换证书时需要使用的证书 ID。

---

# 五、第二阶段：将 CertificateId 配置到 EdgeOne 域名

上传证书成功后，ANSSL.CN 根据：

```yaml
edgeOne:
```

里的每一个目标执行 EdgeOne 证书配置。

例如：

```yaml
edgeOne:
  - label: "EO CDN"
    domain: fa.anssl.cn
    zoneId: zone-cvbgf6ygg9
```

最终对应的腾讯云 EdgeOne API 请求逻辑类似：

```json
{
  "ZoneId": "zone-cvbgf6ygg9",
  "Hosts": [
    "fa.anssl.cn"
  ],
  "Mode": "sslcert",
  "ServerCertInfo": [
    {
      "CertId": "J2JqATrt"
    }
  ]
}
```

其中：

```text
ZoneId
```

来自：

```yaml
zoneId: zone-cvbgf6ygg9
```

而：

```text
Hosts
```

来自：

```yaml
domain: fa.anssl.cn
```

`CertId` 则来自前一步腾讯云 SSL `UploadCertificate` 返回的：

```text
CertificateId
```

于是完整链路就是：

```text
ANSSL.CN 新证书
       │
       ▼
SSL UploadCertificate
       │
       ▼
CertificateId
       │
       ▼
TEO ModifyHostsCertificate
       │
       ├── ZoneId = edgeOne.zoneId
       ├── Hosts  = edgeOne.domain
       ├── Mode   = sslcert
       └── CertId = CertificateId
       │
       ▼
EdgeOne 域名证书更新完成
```

---

# 六、同时部署多个 EdgeOne 域名

`edgeOne` 是一个列表，所以一张证书可以配置多个部署目标。

例如：

```yaml
edgeOne:
  - label: "EO CDN"
    domain: fa.anssl.cn
    zoneId: zone-cvbgf6ygg9

  - label: "marks测试"
    domain: blog.anssl.cn
    zoneId: zone-1232t567x02
```

ANSSL.CN 可以理解为依次处理：

```text
上传证书一次
      │
      ▼
取得 CertificateId
      │
      ├──→ fa.anssl.cn
      │      ZoneId = zone-cvbgf6ygg9
      │
      └──→ blog.anssl.cn
             ZoneId = zone-1232t567x02
```

也就是说没有必要为每一个 EdgeOne 目标重复上传相同证书。

比较合理的处理方式是：

```text
同一张新证书
       │
       ▼
腾讯云 SSL 上传一次
       │
       ▼
得到同一个 CertificateId
       │
       ├── 部署目标 1
       ├── 部署目标 2
       ├── 部署目标 3
       └── ...
```

---

# 七、EO CDN 与 Makers 可以放在同一个列表

这是实际使用中比较有价值的一点。

例如：

```yaml
edgeOne:
  - label: "EO CDN"
    domain: fa.anssl.cn
    zoneId: zone-cvbgf6ygg9

  - label: "marks测试"
    domain: blog.anssl.cn
    zoneId: zone-1232t567x02
```

ANSSL.CN 不需要写成：

```yaml
edgeOneCdn:
```

和：

```yaml
makers:
```

两套完全不同的结构。

实际部署只关心：

```text
证书 ID
域名
ZoneId
```

因此可以统一抽象成：

```yaml
edgeOne:
  - label: ...
    domain: ...
    zoneId: ...
```

`label` 可以根据自己的习惯写成：

```text
EO CDN
Makers
博客
API
测试环境
生产环境
```

它不会参与腾讯云 API 的参数判断。

---

# 八、腾讯云 CAM 权限

这一部分很重要。

如果使用腾讯云子账号的：

```text
SecretId
SecretKey
```

调用 API，就必须给这个 CAM 子账号配置相应权限。

ANSSL.CN 实际测试可用的预设策略组合是：

```text
QcloudSSLFullAccess
+
QcloudTEOFullAccess
```

## 1. QcloudSSLFullAccess

作用：

```text
SSL 证书服务全读写权限
```

它负责允许 ANSSL.CN：

```text
上传 SSL 证书
获得 / 管理 CertificateId
```

腾讯云官方定义中：

```text
QcloudSSLFullAccess
```

包含：

```text
ssl:*
```

---

## 2. QcloudTEOFullAccess

作用：

```text
边缘安全加速平台 EO 全读写访问权限
```

它负责允许 ANSSL.CN 调用 EdgeOne API，为目标域名配置新的证书。

实际使用中，如果只给：

```text
QcloudSSLFullAccess
```

证书可以进入腾讯云 SSL 服务，但 EdgeOne 域名配置阶段会因为没有 TEO 权限而失败。

典型错误：

```text
AuthFailure.UnauthorizedOperation
```

因此实际可用的权限组合是：

```text
CAM 子账号
│
├── QcloudSSLFullAccess
│
└── QcloudTEOFullAccess
```

---

# 九、一个实际遇到的权限问题

最开始只给腾讯云 API 子账号配置了：

```text
QcloudSSLFullAccess
```

结果自动部署时出现：

```text
域名配置失败
code=AuthFailure.UnauthorizedOperation
provider=cloudTencent
business=EXECUTE_BUSINES_EDGEONE
```

这很容易让人误认为是：

```text
SSL 上传失败
```

实际上不是。

因为整个流程包含两个腾讯云产品：

```text
SSL 证书服务
+
EdgeOne
```

只开 SSL 权限只能完成前半段：

```text
ANSSL.CN
      ↓
腾讯云 SSL
      ↓
CertificateId
      ↓
成功
```

到了后半段：

```text
CertificateId
      ↓
EdgeOne ModifyHostsCertificate
      ↓
没有 TEO 权限
      ↓
AuthFailure.UnauthorizedOperation
```

给同一个 CAM 子账号继续增加：

```text
QcloudTEOFullAccess
```

以后，自动部署恢复正常。

因此如果遇到：

```text
AuthFailure.UnauthorizedOperation
```

第一件事应该检查实际使用的 SecretId 对应的 CAM 用户是否同时关联：

```text
QcloudSSLFullAccess
QcloudTEOFullAccess
```

---

# 十、为什么没有继续追求单 Action 的“极限最小权限”

理论上可以继续研究：

```text
ssl:UploadCertificate
teo:ModifyHostsCertificate
...
```

然后人为组合自定义 CAM 策略。

但实际自动部署过程中，不一定只有一个 EdgeOne API 调用。

如果漏掉某个查询、读取或配置权限，最终仍然会得到：

```text
AuthFailure.UnauthorizedOperation
```

对于证书自动续期这种需要长期无人值守的任务，可靠性比节省几个 CAM Action 更重要。

所以 ANSSL.CN 当前采用的是腾讯云已经提供的两个预设策略：

```text
QcloudSSLFullAccess
QcloudTEOFullAccess
```

需要注意：

> 这不是理论上的“最小 API Action 集”，而是目前 ANSSL.CN 实际验证可以正常完成整个自动部署流程的预设策略组合。

安全上更重要的是：

```text
不要使用主账号永久密钥
```

而是单独创建一个：

```text
证书自动部署专用 CAM 子账号
```

只给它关联：

```text
QcloudSSLFullAccess
QcloudTEOFullAccess
```

不要再给：

```text
AdministratorAccess
QCloudResourceFullAccess
```

这样的全局高权限策略。

---

# 十一、推荐的 CAM 配置方式

建议单独创建一个用于 ANSSL.CN 自动部署的 CAM 用户，例如：

```text
anssl-cert-deploy
```

然后只为这个用户关联：

```text
QcloudSSLFullAccess
QcloudTEOFullAccess
```

结构：

```text
腾讯云主账号
     │
     └── CAM 子账号：anssl-cert-deploy
            │
            ├── QcloudSSLFullAccess
            └── QcloudTEOFullAccess
```

然后为这个 CAM 用户创建 API 密钥：

```text
SecretId
SecretKey
```

再交给 ANSSL.CN 使用。

不要在自动部署程序中直接保存腾讯云主账号密钥。

---

# 十二、配置检查

如果自动部署不成功，可以按照下面顺序检查。

## 1. 检查 SecretId / SecretKey

确认 ANSSL.CN 当前使用的是正确 CAM 子账号的密钥。

尤其是在腾讯云中存在多个子账号、多个 API 密钥时，容易出现：

```text
给 A 用户加了权限
```

但实际程序使用的是：

```text
B 用户的 SecretId
```

---

## 2. 检查 CAM 权限

确认同一个用户同时拥有：

```text
QcloudSSLFullAccess
QcloudTEOFullAccess
```

---

## 3. 检查 domain

例如：

```yaml
domain: fa.anssl.cn
```

必须是实际已经接入对应 EdgeOne 站点的域名。

不要把：

```text
站点主域名
```

和：

```text
实际加速域名
```

混淆。

---

## 4. 检查 zoneId

例如：

```yaml
zoneId: zone-cvbgf6ygg9
```

这个值必须与：

```yaml
domain: fa.anssl.cn
```

实际所属 EdgeOne 站点对应。

如果：

```text
domain 属于 A 站点
```

却填写：

```text
B 站点的 ZoneId
```

EdgeOne 不可能正确修改该域名的证书。

---

## 5. 检查证书是否已经上传成功

EdgeOne 的自有证书配置要求使用腾讯云 SSL 中存在的：

```text
CertificateId
```

所以部署链路必须先成功完成：

```text
UploadCertificate
```

然后才能：

```text
ModifyHostsCertificate
```

---

# 十三、API 关系总结

ANSSL.CN 这一套并不复杂。

实际只需要理解两个腾讯云服务。

## 腾讯云 SSL

Endpoint：

```text
ssl.tencentcloudapi.com
```

负责：

```text
上传证书
        ↓
CertificateId
```

核心 API：

```text
UploadCertificate
```

---

## 腾讯云 EdgeOne

Endpoint：

```text
teo.tencentcloudapi.com
```

负责：

```text
将 CertificateId 配置给 EdgeOne 域名
```

核心 API：

```text
ModifyHostsCertificate
```

核心参数：

```text
ZoneId
Hosts
Mode = sslcert
ServerCertInfo[].CertId
```

---

# 十四、最终数据关系

配置：

```yaml
edgeOne:
  - label: "EO CDN"
    domain: fa.anssl.cn
    zoneId: zone-cvbgf6ygg9

  - label: "marks测试"
    domain: blog.anssl.cn
    zoneId: zone-1232t567x02
```

经过自动部署以后，实际关系就是：

```text
新证书
 │
 ▼
腾讯云 SSL
 │
 ▼
CertificateId
 │
 ├─────────────────────────────┐
 │                             │
 ▼                             ▼
fa.anssl.cn                  blog.anssl.cn
 │                             │
ZoneId                         ZoneId
zone-cvbgf6ygg9                zone-1232t567x02
 │                             │
 ▼                             ▼
EO CDN                         Makers
```

对 ANSSL.CN 来说，这两个目标的配置形式完全一致。

---

# 十五、配置模板

可以直接按照下面的形式添加更多 EdgeOne 目标：

```yaml
edgeOne:
  - label: "目标名称 1"
    domain: example1.com
    zoneId: zone-xxxxxxxx

  - label: "目标名称 2"
    domain: example2.com
    zoneId: zone-yyyyyyyy

  - label: "目标名称 3"
    domain: example3.com
    zoneId: zone-zzzzzzzz
```

如果同一张证书覆盖多个域名，也可以把需要自动部署的目标全部列出来。

ANSSL.CN 在证书续期后即可按照配置逐一更新。

---

# 十六、安全建议

证书自动部署意味着程序需要持有：

```text
腾讯云 API SecretId
腾讯云 API SecretKey
SSL 证书私钥
```

因此至少应该做到：

1. 使用专用 CAM 子账号，不使用主账号 API 密钥；
2. CAM 子账号只关联自动部署所需的腾讯云产品策略；
3. 不给 `AdministratorAccess`；
4. 不给 `QCloudResourceFullAccess`；
5. SecretKey 不写入公开仓库；
6. 日志中不要输出 SecretKey；
7. 日志中不要输出完整证书私钥；
8. 定期轮换腾讯云 API 密钥；
9. API 调用失败时记录腾讯云返回的 `RequestId`，方便排查。

目前经过实际验证的策略组合：

```text
QcloudSSLFullAccess
QcloudTEOFullAccess
```

足以完成 ANSSL.CN 的腾讯云 SSL 上传与 EdgeOne 自动部署。

---

# 十七、结论

ANSSL.CN 自动将 SSL 证书部署到腾讯云 EdgeOne 的核心逻辑可以概括为：

```text
签发 / 续期证书
      ↓
UploadCertificate
      ↓
CertificateId
      ↓
读取 edgeOne 配置
      ↓
domain + zoneId
      ↓
ModifyHostsCertificate
      ↓
完成 EdgeOne SSL 更新
```

配置层只需要：

```yaml
edgeOne:
  - label: "EO CDN"
    domain: fa.anssl.cn
    zoneId: zone-cvbgf6ygg9

  - label: "marks测试"
    domain: blog.anssl.cn
    zoneId: zone-1232t567x02
```

其中：

```text
label
```

只负责区分目标；

```text
domain + zoneId
```

才是自动部署到 EdgeOne 时真正需要的数据。

实际测试表明，同一套配置既可以用于普通 EdgeOne CDN 域名，也可以用于 Makers 自定义域名。

腾讯云 CAM 方面，当前实际验证可用的组合为：

```text
QcloudSSLFullAccess
+
QcloudTEOFullAccess
```

这样，ANSSL.CN 在以后每次完成证书续期后，就可以继续自动完成：

```text
新证书
→ 腾讯云 SSL
→ EO CDN
→ Makers
```

无需再手工登录腾讯云控制台逐个替换证书。

---

## 参考的腾讯云官方接口

本文涉及的腾讯云官方接口主要为：

```text
SSL：
UploadCertificate
Endpoint：ssl.tencentcloudapi.com
API Version：2019-12-05

EdgeOne：
ModifyHostsCertificate
Endpoint：teo.tencentcloudapi.com
API Version：2022-09-01
```

腾讯云官方文档对 `ModifyHostsCertificate` 的说明是：如果需要配置自有证书，应先将证书上传至 SSL 证书服务，再在 EdgeOne 接口中传入对应证书 ID。

这与 ANSSL.CN 当前的自动部署流程一致。
