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
    "metric2Label": "样本总量",
    "metric3": "55.84 dB",
    "metric3Label": "独立测试集平均 PSNR",
    "source": "硕士课题",
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
          "将重建影像用于 NDVI/OTSU 浒苔提取、Chl-a 反演，以及基于最大互相关（MCC）的海表流场分析。"
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
      "OTSU",
      "ENVI",
      "时序分析"
    ],
    "metric1": "2015—2022",
    "metric1Label": "海冰影像分析时段",
    "metric2": "多源长时序遥感",
    "metric2Label": "多传感器时序观测",
    "metric3": "已授权",
    "metric3Label": "海冰监测系统软件著作权",
    "source": "国家级大学生创新创业项目 · 2023",
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
          "负责海冰提取算法构建和代码编写，在 GEE 中批量调用 Sentinel-2 影像，开展 2015—2022 年海冰提取工作。",
          "根据海冰与海水的光谱差异，引入 OTSU 自动阈值分割，完成海冰识别、面积统计与结果输出。",
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
  },
  "internship": {
    "id": "internship",
    "title": "遥感影像分割软件 优化与部署",
    "subtitle": "SegFormer 森林语义分割软件的跨平台部署与工程落地",
    "category": "企业实习",
    "period": "2026.05 — 2026.07",
    "role": "跨平台部署 · TensorRT 加速 · 预处理提速 · bug 修复",
    "status": "已完成",
    "theme": "coral",
    "tags": [
      "Linux",
      "Windows",
      "Conda",
      "SegFormer",
      "TensorRT"
    ],
    "metric1": "Linux / Windows",
    "metric1Label": "跨平台部署",
    "metric2": "Conda",
    "metric2Label": "环境隔离与依赖配置",
    "metric3": "TensorRT",
    "metric3Label": "推理加速部署",
    "source": "企业实习 · 产品研制总结",
    "intro": "实习期间参与一套面向国产高分辨率遥感影像的桌面处理软件研制，负责森林语义分割链路的工程落地：在 Linux 与 Windows 上部署软件并用 Conda 配置环境，接入 TensorRT 推理加速，压缩送入模型前的影像预处理耗时，并承担软件 bug 修复与研制报告撰写。",
    "sections": [
      {
        "title": "项目背景",
        "paragraphs": [
          "软件面向高分辨率卫星影像的森林识别与定量统计，把「原始影像 → 几何校正 → 森林分割 → 覆盖率统计」组织为可批量执行的业务流程。分割模型与算法由团队提供，本人的工作集中在部署、提速与软件稳定性这条工程链路上。",
          "森林识别在这里被定义为森林与非森林的像素级语义分割，而不是目标检测框：森林是连续面状地物，边界不规则、内部结构复杂，检测框会不可避免地包含道路、裸地与阴影，无法直接支撑覆盖面积和覆盖率计算，只有像素级掩膜才能给出可量算的空间边界。"
        ],
        "bullets": []
      },
      {
        "title": "我的工作",
        "paragraphs": [],
        "bullets": [
          "跨平台部署与环境配置：在 Linux 与 Windows 两套平台上完成森林分割软件的部署。用 Conda 建立独立环境并固定依赖版本，逐一处理两个系统在运行库、编译器与图形界面依赖上的差异，使同一套环境在两端都能复现，避免换一台机器就跑不起来。",
          "TensorRT 推理加速部署：把分割模型接入 TensorRT 推理链路并部署到目标机器，核对加速前后的输入输出尺寸与分割结果一致性，确保提速不以精度为代价。",
          "模型输入的预处理提速：SegFormer 对输入的通道数与数值范围有固定要求，而原始影像幅面大、为单通道且含无效值。围绕「把影像整理成模型可接受的输入」这一环节重构处理流程，缩短预处理耗时，避免它成为整条链路的瓶颈。",
          "bug 修复与报告撰写：定位并修复软件在数据处理、界面交互与推理调用中的多类问题；把研制过程与交付情况整理成研究报告，作为项目交付文档。"
        ]
      },
      {
        "title": "工程落地",
        "paragraphs": [],
        "bullets": [
          "交付的目标不是「某一次推理能出结果」，而是这条链路在目标机器上能稳定、可重复地跑完，环境配置与部署方式本身就是交付物。",
          "环境用 Conda 隔离并锁定依赖版本：依赖能装、能复现，才算部署完成。",
          "推理侧用 TensorRT 加速，并核对加速前后的输入输出尺寸与分割结果一致性，保证精度不因加速而下降。",
          "模型对输入通道有固定要求，原始全色影像是单通道，部署时通过一层包装适配为模型可接受的输入形式。",
          "大幅面影像按固定尺寸图块切分后分批推理，再拼接回完整区域掩膜，避免一次性载入整景影像带来的内存压力。",
          "森林覆盖率按「森林像素数 ÷ ROI 有效像素数」统计，并在图块拼接与范围裁剪之后保持统计口径一致。"
        ]
      },
      {
        "title": "结果",
        "paragraphs": [
          "软件形成了从影像读取、预处理、模型推理到覆盖率输出的完整闭环，可在 Linux 与 Windows 上完成批量森林分割任务，输出栅格掩膜与统计数据供人工复核。部署侧交付了可复现的 Conda 环境配置与 TensorRT 推理链路，配合 bug 修复与研制报告，把模型从「能跑通」推进到「可交付」。"
        ],
        "bullets": []
      }
    ],
    "gallery": [
      {
        "src": "assets/project/internship/software-ui.jpg",
        "alt": "森林分割软件图形界面：地图叠加显示与一键批量处理",
        "caption": "森林分割软件的图形界面与批量处理入口"
      },
      {
        "src": "assets/project/internship/forest-mask.jpg",
        "alt": "森林分割掩膜与原始影像叠加，红色区域为模型预测的森林",
        "caption": "森林分割掩膜叠加结果"
      }
    ],
    "markdown": "assets/project/internship.md"
  }
};
