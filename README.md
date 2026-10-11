# 叶志远 · 个人主页

厦门大学硕士研究生的个人主页，用于展示研究方向、项目经历、近期动态与旅行足迹。

线上地址：<https://zhiyyeah.github.io>

## 技术栈

纯静态站点，无运行时依赖或打包工具：

- HTML5 + 语义化标签
- 原生 CSS（CSS 变量主题、Flex/Grid 布局、媒体查询响应式）
- 原生 JavaScript（ES2020+，无框架、无打包工具）
- 本地 SVG 地图（Natural Earth 投影底图）

克隆下来直接打开 `index.html` 即可运行，不需要 `npm install`。修改项目 Markdown 后，用 Node.js 执行 `node tools/build-projects.mjs` 同步详情数据；生成文件随网站一起提交。

## 目录结构

```
.
├── index.html              # 单页入口，包含全部板块结构
├── styles.css              # 全站样式，按板块与响应式规则组织
├── script.js               # 交互逻辑：导航高亮、时间线折叠、足迹地图渲染
├── project-details.js      # 项目详情弹窗、图示切换与海流并排对比
├── travel-photos.js        # 足迹照片数据集 window.travelPhotos（48 条记录）
├── _config.yml             # GitHub Pages 构建配置：排除不发布到网站的维护文档
├── tools/
│   └── build-projects.mjs  # 从项目 Markdown 同步网页详情数据
└── assets/
    ├── avatar.jpg          # 首页头像
    ├── maps/
    │   ├── china.svg           # 国内足迹底图
    │   └── southeast-asia.svg  # 东南亚足迹底图
    ├── project/
    │   ├── README.md       # 资料依据、数值口径与维护说明（不随网站发布）
    │   ├── *.md            # 四个项目的展示正文
    │   ├── projects.js     # 生成的详情数据，支持直接打开本地页面
    │   └── */              # 网页使用的 JPG；原始 PNG 与旧 WebP 已删除
    ├── updates/            # 「近期动态」时间线配图
    ├── travel/
    │   ├── README.md       # 照片整理说明（时间、坐标来源、无 GPS 处理）（不随网站发布）
    │   └── web/            # 网页用 JPEG 副本，长边 ≤1200px，已剥离 EXIF
    └── videos/             # 台球 / CSGO / PUBG 视频素材
        ├── billiards/      # 接清.MP4、炸清.MP4
        ├── csgo/           # 1V5.MP4、5k.MP4
        └── pubg/           # 大文件被 .gitignore 排除，仅本地保留
```

## 页面板块

| 板块 | 锚点 | 内容 |
| --- | --- | --- |
| 首屏 | `#home` | 头像、姓名、一句话简介、快捷跳转按钮 |
| 关于我 | `#about` | 研究方向、技术栈、兴趣爱好 + 所在地/身份/方向速览 |
| 近期动态 | `#notes` | 倒序时间线，默认展示 3 条，其余折叠 |
| 项目与经历 | `#work` | 4 张卡片（三个科研项目 + 一段企业实习），点击展示统一的详情弹窗，每项最多 5 张配图 |
| 旅行足迹 | `#travel` | 国内 / 海外双地图 + 地点标签 + 可筛选相册 |
| 联系我 | `#contact` | 邮箱入口 `zhiyyeah@gmail.com` |

## 主要交互

**导航与页头**（`script.js` 顶部）
- 滚动超过 8px 给页头加 `.is-scrolled`，出现分割线与阴影。
- 滚动时按「距视口顶部最近」的板块计算，实时高亮对应导航项。

**动态时间线**
- `#hidden-timeline` 中的历史动态默认隐藏，点击「展开动态」切换 `.is-open`，按钮文案与 `aria-expanded` 同步更新。
- 动态配图点击可放大（`.zoomed`），每次只放大一张，点击页面其他区域还原。

**项目详情**（`project-details.js`）

- 支持 `#project-super-resolution`、`#project-vegetation`、`#project-sea-ice`、`#project-internship` 链接直接打开详情。
- Esc、关闭按钮或点击弹窗外侧关闭详情，焦点返回项目卡片。
- 图示可切换、点击打开 JPG 大图；海表流场默认并排展示原始与超分辨率结果。

**旅行足迹地图**
- 底图用 Mercator 投影，`travelMapBounds` 定义两幅地图的经纬度范围，照片坐标按线性/Mercator 公式换算成百分比定位。
- 无 GPS 的照片使用地标参考点（西安兵马俑、华山、重庆洪崖洞、漳州土楼），参考点**不代表实际拍摄位置**；武汉、厦门则复用同组照片的 GPS。
- 标记密集时自动沿 5 圈半径搜索可用位置，把图标推开并用细线连回真实地点，避免地图缩小时互相遮挡。
- 悬停或聚焦标记弹出预览卡（最新一张照片 + 地点 + 拍摄日期 + 该地点照片总数），自动避让视口边缘。
- 点击标记或地点标签会筛选相册、自动展开 `<details>` 并平滑滚动过去。
- 相册支持「全部照片 / 国内与海上 / 东南亚」筛选，按年份分组倒序展示，点击图片在新标签页打开原图。

## 维护内容

### 更新项目

修改 `assets/project/` 下相应的 Markdown，运行 `node tools/build-projects.mjs`，并提交 Markdown、生成的 `projects.js` 与当前 JPG 配图。首页卡片文案及主图在 `index.html` 单独维护。图片总数包含并排对比的每张原图，每个项目不超过 5 张。资料依据与数值说明见 `assets/project/README.md`（该文件不随网站发布）。

### 更新动态

在 `index.html` 的 `#notes` 板块中新增 `<article class="timeline-item">`：前三篇直接放在 `.updates-timeline` 内，更早的放在 `#hidden-timeline` 里。结构为日期块（`.timeline-date`）+ 内容卡（`.update-card`）。配图可选，单图用 `.update-media`，并排两图加 `.update-media--grid`，需要完整显示内容（如运动轨迹长图）加 `.update-media--contain`。

### 新增足迹照片

1. 把网页用副本放进 `assets/travel/web/`，命名沿用 `序号-地点.jpg`（长边 ≤1200px、去除 EXIF）。
2. 在 `travel-photos.js` 的 `window.travelPhotos` 数组追加一条记录：

```js
{
  "index": 50,
  "title": "西湖",                                  // 照片标题
  "place": "hangzhou",                             // 地点分组 ID，需与 script.js 的 placeNames 对应
  "location": "杭州 · 西湖",                        // 展示用地点描述
  "date": "2018-07-25 13:54",                      // 基准取原片 EXIF DateTimeOriginal，UTC+8
  "albumDate": null,                               // 相册显示时间（与 EXIF 不一致时记录，便于核对）
  "timezone": "UTC+08:00",
  "photo": "assets/travel/web/01-hangzhou.jpg",    // 网页副本路径
  "original": "2018-07-25_13-54-40_杭州西湖.jpg",   // 原片文件名
  "region": "china",                               // "china" | "sea"，对应相册筛选
  "map": "china",                                  // "china" | "sea" | null（null 表示无 GPS，走参考点）
  "lat": 30.241767,
  "lng": 120.144642,
  "locationSource": "照片 GPS"                      // 坐标来源说明
}
```

3. 若是新地点，还需在 `script.js` 中补两处：
   - `placeNames` 映射表里加 `地点ID: "中文名"`；
   - 该地点没有 GPS 时，在 `travelReferencePlaces` 中加参考坐标，并在 `assets/travel/README.md` 说明来源。

> 原片与实况照片的 `.mov` 属于本地资料，由 `.gitignore` 排除（约 282MB，且含 EXIF/GPS 元数据），不进入仓库。照片整理的完整依据见 `assets/travel/README.md`（该文件不随网站发布）。

## 本地预览

因为页面通过 `<script src>` 加载数据集，直接双击 `index.html` 也能工作；如需更接近线上环境，起一个静态服务器：

```bash
python -m http.server 8000
# 然后访问 http://localhost:8000
```

## 部署

仓库名为 `Zhiyyeah.github.io`，属于 GitHub Pages 的**用户站点**。在仓库设置中启用从 `main` 分支根目录发布后，推送即可更新站点。详情数据在本地同步，无需额外的构建工作流。

GitHub Pages 默认用 Jekyll 构建本仓库（仓库里没有 `.nojekyll`）。根目录的 `_config.yml` 用 `exclude` 把 `assets/project/README.md` 与 `assets/travel/README.md` 排除在发布之外：这两份维护文档在仓库内和本地都能正常阅读，但网站不提供它们，访问对应网址会返回 404。

```bash
git add .
git commit -m "更新内容"
git push origin main
```

## 约定与注意事项

- **响应式**：主要断点 `1080px` / `850px` / `820px` / `700px` / `560px` / `480px`；卡片网格按 4 / 2 / 1 列自适应，窄屏下项目详情和双地图改为上下排列、照片网格降为 2 列再到 1 列。全局 `img { max-width: 100%; height: auto; }` 兜底。
- **可访问性**：导航、地图、相册容器均带 `aria-label`；筛选与标记使用 `aria-pressed` 表达选中态；预览卡通过 `aria-describedby` 关联触发元素；装饰性 SVG 与图标标 `aria-hidden`。
- **性能**：项目卡片、时间线与相册图片使用 `loading="lazy"` + `decoding="async"`，详情图示在打开项目后加载。
- **不随网站发布的文件**：由 `_config.yml` 的 `exclude` 列表决定，新增维护文档时在这里登记。Jekyll 的 `exclude` 会整体覆盖内置默认值，因此该文件里同时列出了 `Gemfile`、`node_modules` 等默认项。
- **未被引用的素材**：`assets/videos/**` 目前未接入页面；`billiards/`、`csgo/` 下的 MP4 会随仓库提交，`pubg/` 下的视频被 `.gitignore` 排除，仅本地保留。
- **已删除的旧版本**：项目目录下原始的 PNG、旧 WebP 展示版本，以及未被引用的 `assets/china-outline.svg`，共 17 个文件已删除（约 12.4 MB）；旧 `sea-ice/study-area.jpg` 仍留在本地并由 `.gitignore` 排除。
- **样式为单文件**：`styles.css` 未做拆分，修改时按文件内的注释分区（如 `/* ===== 旅行足迹：经纬度地图 ===== */`）定位。
