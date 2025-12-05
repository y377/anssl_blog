---
title: 表格测试
---

# 新版主题表格测试

## 表格一

| BMC Power Fault 日志报错 | 指向 Power Rail | 指向可能 NG 部件 | 内存位置 |
|--------------------------|------------------|-------------------|----------|
| `PVDDQ_CPU0_GROUP0_FAULT` | `PVDDQ_ABCD_CPU0` | 内存； 主板； CPU | `P0_C0_D0` `P0_C1_D0` `P0_C2_D0` `P0_C3_D0` <br> `P0_C0_D1` `P0_C1_D1` `P0_C2_D1` `P0_C3_D1` |
| `PVDDQ_CPU0_GROUP1_FAULT` | `PVDDQ_EFGH_CPU0` | 内存； 主板； CPU | `P0_C4_D0` `P0_C5_D0` `P0_C6_D0` `P0_C7_D0` <br> `P0_C4_D1` `P0_C5_D1` `P0_C6_D1` `P0_C7_D1` |
| `PVDDQ_CPU1_GROUP0_FAULT` | `PVDDQ_ABCD_CPU1` | 内存； 主板； CPU | `P1_C0_D0` `P1_C1_D0` `P1_C2_D0` `P1_C3_D0` <br> `P1_C0_D1` `P1_C1_D1` `P1_C2_D1` `P1_C3_D1` |
| `PVDDQ_CPU1_GROUP1_FAULT` | `PVDDQ_EFGH_CPU1` | 内存； 主板； CPU | `P1_C4_D0` `P1_C5_D0` `P1_C6_D0` `P1_C7_D0` <br> `P1_C4_D1` `P1_C5_D1` `P1_C6_D1` `P1_C7_D1` |
| `PVPP_CPU0_GROUP0_FAULT` | `PVPP_ABCD_CPU0` | 内存； 主板 | `P0_C0_D0` `P0_C1_D0` `P0_C2_D0` `P0_C3_D0` <br> `P0_C0_D1` `P0_C1_D1` `P0_C2_D1` `P0_C3_D1` |
| `PVPP_CPU0_GROUP1_FAULT` | `PVPP_EFGH_CPU0` | 内存； 主板 | `P0_C4_D0` `P0_C5_D0` `P0_C6_D0` `P0_C7_D0` <br> `P0_C4_D1` `P0_C5_D1` `P0_C6_D1` `P0_C7_D1` |
| `PVPP_CPU1_GROUP0_FAULT` | `PVPP_ABCD_CPU1` | 内存； 主板 | `P1_C0_D0` `P1_C1_D0` `P1_C2_D0` `P1_C3_D0` <br> `P1_C0_D1` `P1_C1_D1` `P1_C2_D1` `P1_C3_D1` |
| `PVPP_CPU1_GROUP1_FAULT` | `PVPP_EFGH_CPU1` | 内存； 主板 | `P1_C4_D0` `P1_C5_D0` `P1_C6_D0` `P1_C7_D0` <br> `P1_C4_D1` `P1_C5_D1` `P1_C6_D1` `P1_C7_D1` |
| `PVTT_CPU0_GROUP0_FAULT` | `PVTT_ABCD_CPU0` | 内存； 主板 | `P0_C0_D0` `P0_C1_D0` `P0_C2_D0` `P0_C3_D0` <br> `P0_C0_D1` `P0_C1_D1` `P0_C2_D1` `P0_C3_D1` |
| `PVTT_CPU0_GROUP1_FAULT` | `PVTT_EFGH_CPU0` | 内存； 主板 | `P0_C4_D0` `P0_C5_D0` `P0_C6_D0` `P0_C7_D0` <br> `P0_C4_D1` `P0_C5_D1` `P0_C6_D1` `P0_C7_D1` |
| `PVTT_CPU1_GROUP0_FAULT` | `PVTT_ABCD_CPU1` | 内存； 主板 | `P1_C0_D0` `P1_C1_D0` `P1_C2_D0` `P1_C3_D0` <br> `P1_C0_D1` `P1_C1_D1` `P1_C2_D1` `P1_C3_D1` |
| `PVTT_CPU1_GROUP1_FAULT` | `PVTT_EFGH_CPU1` | 内存； 主板 | `P1_C4_D0` `P1_C5_D0` `P1_C6_D0` `P1_C7_D0` <br> `P1_C4_D1` `P1_C5_D1` `P1_C6_D1` `P1_C7_D1` |

## 表格二

| BMC Power Fault 日志报错            | 指向 Power Rail      | 指向可能 NG 部件     | 备注 |
|--------------------------------------|------------------------|-----------------------|------|
| `PVNN_PCH_AUX_FAULT`                | `PVNN_STBY`            | 主板                   |      |
| `P1V05_PCH_AUX_FAULT`               | `P1V05_STBY`           | 主板                   |      |
| `P12V_FAULT`                        | `P12V`                 | 主板                   |      |
| `P12V_STBY_FAULT`                   | `P12V_STBY`            | 主板                   |      |
| `P12V_NVME_FAULT`                   | `P12V_NVME`            | 主板；硬盘背板          |      |
| `P3V3_FAULT`                        | `P3V3`                 | 主板                   |      |
| `P5V_AUX_FAULT`                     | `P5V_STBY`             | 主板                   |      |
| `P3V3_AUX_FAULT`                    | `P3V3_STBY`            | 主板；其他小板卡        |      |
| `P5V_FAULT`                         | `P5V`                  | 右耳；主板             |      |
| `P12V_FAN_FAULT`                    | `P12V_FAN0`~`P12V_FAN5` | 风扇；主板            |      |
| `P1V2_AUX_FAULT`                    | `P1V2_STBY`            | 主板                   |      |
| `P1V15_AUX_FAULT`                   | `P1V15_STBY`           | 主板                   |      |
| `P1V8_AUX_FAULT`                    | `P1V8_STBY`            | 主板                   |      |
| `P2V5_AUX_FAULT`                    | `P2V5_STBY`            | 主板                   |      |
| `PVCCIN_CPU0_Fault`                 | `PVCCIN_CPU0`          | 主板，CPU              |      |
| `PVCCIN_CPU1_Fault`                 | `PVCCIN_CPU1`          | 主板，CPU              |      |
| `PVCCSA_CPU0_Fault`                 | `PVCCSA_CPU0`          | 主板，CPU              |      |
| `PVCCSA_CPU1_Fault`                 | `PVCCSA_CPU1`          | 主板，CPU              |      |
| `PVCCIO_CPU0_Fault`                 | `PVCCIO_CPU0`          | 主板，CPU              |      |
| `PVCCIO_CPU1_Fault`                 | `PVCCIO_CPU1`          | 主板，CPU              |      |
| `PVCCANA_CPU0_Fault`                | `PVCCANA_CPU0`         | 主板，CPU              |      |
| `PVCCANA_CPU1_Fault`                | `PVCCANA_CPU1`         | 主板，CPU              |      |
| `P1V8_PCIE_CPU0_FAULT`              | `P1V8_CPU0`            | 主板，CPU              |      |
| `P1V8_PCIE_CPU1_FAULT`              | `P1V8_CPU1`            | 主板，CPU              |      |