// Generated from project Markdown by tools/build-projects.mjs.
window.projectDetails = {
  "super-resolution": {
    "id": "super-resolution",
    "title": "水色遥感影像超分辨率",
    "subtitle": "面向 GOCI-2 的真实退化建模与 W-MREA 重建",
    "category": "硕士研究",
    "period": "2025.03 — 至今",
    "role": "数据构建 · 模型设计 · 应用验证",
    "status": "研究进行中",
    "theme": "teal",
    "tags": [
      "PyTorch",
      "Python",
      "GOCI-2",
      "Landsat-8/9",
      "深度学习",
      "Linux",
      "Conda"
    ],
    "metric1": "8×",
    "metric1Label": "空间超分辨率倍率",
    "metric2": "11,954",
    "metric2Label": "退化样本总量",
    "metric3": "55.84 dB",
    "metric3Label": "独立测试集平均 PSNR",
    "source": "组会与周报 · 更新至 2026.10",
    "featured": "海表流场对比（T3—T4，间隔 1 h）",
    "intro": "面向高时间分辨率、弱纹理的水色遥感影像，学习真实成像退化，在恢复空间细节的同时验证水色反演与海流分析的可用性。",
    "sections": [
      {
        "title": "研究目标",
        "paragraphs": [
          "GOCI-2 提供小时级观测，但 250 m 空间分辨率限制了锋面、藻华和小尺度海流的识别。研究以 Landsat-8/9 为高分辨率参考，开展 8 倍重建，并关注光谱关系的保持。"
        ],
        "bullets": []
      },
      {
        "title": "我的工作",
        "paragraphs": [],
        "bullets": [
          "构建包含真实模糊核和噪声的退化池，生成 11,954 个样本，按 7:2:1 划分训练、验证与测试集。",
          "设计 W-MREA 水体多尺度残差边缘注意力网络，结合 MAE 与光谱角损失，对比 EDSR、RCAN、DBPN、HAT 和 FreMamba。",
          "将重建影像用于 NDVI/Otsu 浒苔提取、Chl-a 反演，以及基于最大互相关（MCC）的海表流场分析。"
        ]
      },
      {
        "title": "结果与进展",
        "paragraphs": [
          "独立测试集平均 PSNR 为 55.84 dB，高于 HAT 的 55.61 dB。锋面边界与平滑水体的弱纹理恢复更清晰；多景浒苔实验中面积结果更接近 Landsat 参考，但仍存在高估。",
          "日本海案例中，基于间隔 1 h 的两时相影像，分别提取原始与超分辨率影像的 MCC 海表流场。并排结果显示局部流向转折更连续，Chl-a 统计分布总体保持；与 CMEMS 的对比仍属定性验证。"
        ],
        "bullets": []
      }
    ],
    "gallery": [
      {
        "src": "assets/project/super-resolution/workflow.jpg",
        "alt": "真实退化建模、样本生成与 GOCI-2 超分辨率应用的技术路线",
        "caption": "真实退化建模与重建流程"
      },
      {
        "src": "assets/project/super-resolution/front-reconstruction.jpg",
        "alt": "原始低分辨率、插值、EDSR、RCAN、DBPN、W-MREA 与参考影像在锋面区域的重建对比",
        "caption": "锋面区域的细节恢复对比"
      },
      {
        "src": "assets/project/super-resolution/psnr-comparison.jpg",
        "alt": "不同模型在训练集和独立测试集上的 PSNR 分布",
        "caption": "训练与独立测试集的 PSNR 分布"
      },
      {
        "caption": "海表流场对比（T3—T4，间隔 1 h）",
        "images": [
          {
            "src": "assets/project/super-resolution/surface-current.jpg",
            "alt": "原始 GOCI-2 影像提取的日本海 MCC 海表流场，底图为叶绿素浓度",
            "caption": "原始 GOCI-2"
          },
          {
            "src": "assets/project/super-resolution/surface-current_sr.jpg",
            "alt": "8 倍超分辨率影像提取的同区域同时间间隔 MCC 海表流场",
            "caption": "8× 超分辨率"
          }
        ]
      }
    ],
    "markdown": "assets/project/super-resolution.md"
  },
  "vegetation": {
    "id": "vegetation",
    "title": "艾比湖流域植被覆盖度",
    "subtitle": "流域植被覆盖度、地物分类与耕地提取",
    "category": "本科毕业论文",
    "period": "2024.01 — 2024.05",
    "role": "遥感处理 · 时序分析 · 分类建模",
    "status": "已完成",
    "theme": "green",
    "tags": [
      "Google Earth Engine",
      "Python",
      "Landsat-8",
      "Random Forest",
      "时序分析"
    ],
    "metric1": "1,712 景",
    "metric1Label": "Landsat-8 影像",
    "metric2": "88 个月",
    "metric2Label": "月度植被覆盖度数据",
    "metric3": "96%",
    "metric3Label": "2023 年分类总体精度",
    "source": "本科毕业论文 · 2024",
    "intro": "以新疆艾比湖流域为研究区，依托 Google Earth Engine 生成植被覆盖度数据，结合物候、地形与纹理识别自然植被和耕地。",
    "sections": [
      {
        "title": "研究目标",
        "paragraphs": [
          "研究区涵盖艾比湖、赛里木湖及周边山地、绿洲和荒漠。针对自然植被与人工耕地交错分布的特点，分析 2013—2023 年植被覆盖度变化，提取耕地并刻画其空间分布。"
        ],
        "bullets": []
      },
      {
        "title": "我的工作",
        "paragraphs": [],
        "bullets": [
          "使用 GEE Python API 处理 1,712 景 Landsat-8 影像，通过 NDVI 和像元二分模型生成 88 个月的植被覆盖度数据。",
          "采用年度合成与 Sen 中值斜率分析长期变化，利用月度差值突出自然植被、耕地与小麦的物候差异。",
          "融合 FVC、DEM、坡度及 GLCM 纹理特征，构建五类随机森林分类器；分层抽取 5,000 个样本，以 7:3 划分训练和验证数据。"
        ]
      },
      {
        "title": "主要结果",
        "paragraphs": [
          "FVC 空间图以 0—1 连续色标呈现覆盖度差异：绿洲耕地覆盖度较高，山区分布自然植被，荒漠区覆盖度较低。",
          "五类分类区分水域与冰雪、自然植被、非小麦耕地、荒漠与建筑、小麦；局部结果与原始影像、WorldCereal 对照。2023 年总体精度按论文报告为 96%，Kappa 为 0.96。"
        ],
        "bullets": []
      }
    ],
    "gallery": [
      {
        "src": "assets/project/vegetation/研究区域第二版_line300.jpg",
        "alt": "艾比湖流域研究范围、艾比湖与赛里木湖及其在新疆的位置",
        "caption": "艾比湖流域研究区域与地理位置"
      },
      {
        "src": "assets/project/vegetation/空间分布scalebar_Colorbar300.jpg",
        "alt": "艾比湖流域植被覆盖度空间分布，连续色标范围为 0 到 1",
        "caption": "植被覆盖度 FVC 的空间差异"
      },
      {
        "src": "assets/project/vegetation/class500_legend.jpg",
        "alt": "水域与冰雪、自然植被、非小麦耕地、荒漠与建筑、小麦的五类分类结果",
        "caption": "融合物候、地形与纹理的五类地物分类"
      },
      {
        "src": "assets/project/vegetation/Class对比.jpg",
        "alt": "局部原始遥感影像、WorldCereal 耕地产品与本研究分类结果对比",
        "caption": "原始影像、WorldCereal 与本研究分类对比"
      }
    ],
    "markdown": "assets/project/vegetation.md"
  },
  "sea-ice": {
    "id": "sea-ice",
    "title": "辽东湾海冰监测与预警",
    "subtitle": "多源遥感分析与海冰监测系统开发",
    "category": "国家级大创项目",
    "period": "本科阶段",
    "role": "算法构建 · 代码编写",
    "status": "软著已授权",
    "theme": "blue",
    "tags": [
      "Google Earth Engine",
      "Sentinel-2",
      "Otsu",
      "ENVI",
      "时序分析"
    ],
    "metric1": "2015—2022",
    "metric1Label": "海冰影像分析时段",
    "metric2": "多源遥感",
    "metric2Label": "多传感器时序观测",
    "metric3": "已授权",
    "metric3Label": "海冰监测系统软件著作权",
    "source": "项目申请书与答辩材料 · 个人成果确认",
    "intro": "围绕辽东湾冬季冰情，利用多源遥感提取海冰分布与面积，分析冰情和气温的关系，为港口、航道与海洋工程的风险防范提供信息。",
    "sections": [
      {
        "title": "项目目标",
        "paragraphs": [
          "辽东湾冬季海冰影响航运、养殖和海上设施。在研究区域的矢量边界内，结合 Landsat-8、MODIS 与 Sentinel-2 影像研究海冰分布与面积，并探索气象因子驱动的预警方法。"
        ],
        "bullets": []
      },
      {
        "title": "我的工作",
        "paragraphs": [],
        "bullets": [
          "负责海冰提取算法构建和代码编写，在 GEE 中批量调用 Sentinel-2 影像，开展 2015—2022 年海冰监测。",
          "结合海冰与海水的光谱差异，引入 Otsu 自动阈值分割，完成海冰识别、面积统计与结果输出。",
          "将算法流程整理为《辽东湾海冰监测系统》，该软件著作权已获得授权。"
        ]
      },
      {
        "title": "案例与成果",
        "paragraphs": [
          "2022 年 1 月案例展示 MOD09GA、Sentinel-2 与 Landsat-8 的多时相海冰提取结果和面积统计，呈现海冰分布随时间的变化。",
          "项目完成了遥感监测算法与软件成果积累。预测因子选择、权重确定和海冰预警模型属于申报与答辩材料中的拓展研究目标。"
        ],
        "bullets": []
      }
    ],
    "gallery": [
      {
        "src": "assets/project/sea-ice/ice-distribution.jpg",
        "alt": "2022 年 1 月 MOD09GA、Sentinel-2 与 Landsat-8 提取的辽东湾海冰分布及各时相面积",
        "caption": "2022 年 1 月多源海冰分布与面积"
      },
      {
        "src": "assets/project/sea-ice/study-area-clean.jpg",
        "alt": "根据原始截图整理的辽东湾研究区域及 Landsat-8、MODIS 与 Sentinel-2 影像示意",
        "caption": "研究区域与多源遥感影像（截图整理示意）"
      }
    ],
    "markdown": "assets/project/sea-ice.md"
  }
};
