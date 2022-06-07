<div align="middle">
  <img src="img/banner.jpeg" />
</div><br>

# 漏网之鱼 Catch Fish If You Can

一个实用uTools插件，能够对照预设名单查找“漏网之鱼”，方便快速统计。

<div align="middle">
  <img src="img/thumb.gif" />
</div><br>

<div align="middle">
  <img src="img/img_main.png" width="320" />
  <img src="img/img_set.png" width="320" /> 
</div>



支持的具体功能如下：

- 针对任意文本（无论是否有分隔符），对照单个或多个名单查找缺失的名字，并可同时查看此时正在使用的全名单
  - 可以直接在插件内输入文本
  - 👍可以选中任意文本（甚至excel表格），然后通过utools快捷面板一键呼出“查找漏网之鱼”
- 支持设置名单，自动从文本中识别连续英文字母和汉字字符构成的名字（空格、逗号等其他字符作为分断）
  - 可以直接在设置输入框内键入文本
  - 可以上传文件
  - 👍可以选中任意文本（甚至excel表格），然后通过utools快捷面板一键呼出“新建名单”



## 背景

当辅导员之后我经常遇到一个简单但解决不好的需求：每次收集学生的问卷，想要知道谁还没有填的时候，很麻烦。

我周围朋友几乎没有人专门写代码读文件处理，因为数据量不大。解决方案无外乎两种：

1. 在Excel里面把姓名排序，然后手工对照；
2. 用Excel的VLOOKUP函数对照查找。

我曾经使用方法2，存储了一个学生全名单和带有VLOOKUP公式的模板Excel文件，每次将最新的已填写名单粘到指定位置，获得自动更新的值。但这种方式需要每次打开模板文件，需要记住操作方式，依然很麻烦。这样一个对于计算机来说很容易的任务，即求两个集合差集，为什么对没有码力的普通用户来说那么难做？

我理解的原因是：用户有“求差集”的计算意图，但并不关心如何从名单数据里识别姓名、用来对照的全名单应当以何种形式存储。真正使用时，用户更希望一键选择名单（选择数据）、一键开始计算（表达计算意图），剩下的繁杂工作交给更具智能的程序来做。

“漏网之鱼”即服务于这样的目的。uTools提供了快捷键、超级面板等即为便捷的交互入口，因此本工具以uTools插件的形式完成上述功能。



## DEMO

<div align="middle">
  <video src="https://user-images.githubusercontent.com/36685998/172231412-3751c095-3bc4-46c2-881e-d2a17ce75df2.mp4" /> 
</div>



## 安装

1. 首先确保已安装[uTools](https://u.tools/)。uTools是一个跨Windows、macOS和Linux的效率工具平台，本插件基于uTools的快捷入口（如超级面板）实现一键光速获取结果的效果，打造极为高效的桌面工具。
2. 安装好uTools之后，有两种安装本插件的方式：
   - **推荐**：在官方插件应用市场搜索“漏网之鱼”并安装（见下图），方便后续更新
   - 从本仓库的[release页面](https://github.com/atomiechen/CatchFishIfYouCan/releases)下载插件文件，并通过utools超级面板或选中文件呼出utools来安装插件

<div align="middle">
  <img src="img/market_marked.png" width="600"/>
</div><br>

## Contributors

Atomie CHEN：atomic_cwh@163.com

❤️ 感谢Daci画的logo和banner！

欢迎PR！

