---
id: vegetation
title: 艾比湖流域植被覆盖度
subtitle: 流域植被覆盖度、地物分类与耕地提取
category: 本科毕业论文
period: 2024.01 — 2024.05
role: 遥感处理 · 时序分析 · 分类建模
status: 已完成
theme: green
tags: Google Earth Engine, Python, Landsat-8, Random Forest, 时序分析
metric1: 1,712 景
metric1Label: Landsat-8 影像
metric2: 88 个月
metric2Label: 月度植被覆盖度数据
metric3: 96%
metric3Label: 2023 年分类总体精度
source: 本科毕业论文 · 2024
---

# 艾比湖流域植被覆盖度

以新疆艾比湖流域为研究区，依托 Google Earth Engine 生成植被覆盖度数据，结合物候、地形与纹理识别自然植被和耕地。

## 研究目标

研究区涵盖艾比湖、赛里木湖及周边山地、绿洲和荒漠。针对自然植被与人工耕地交错分布的特点，分析 2013—2023 年植被覆盖度变化，提取耕地并刻画其空间分布。

## 我的工作

- 使用 GEE Python API 处理 1,712 景 Landsat-8 影像，通过 NDVI 和像元二分模型生成 88 个月的植被覆盖度数据。
- 采用年度合成与 Sen 中值斜率分析长期变化，利用月度差值突出自然植被、耕地与小麦的物候差异。
- 融合 FVC、DEM、坡度及 GLCM 纹理特征，构建五类随机森林分类器；分层抽取 5,000 个样本，以 7:3 划分训练和验证数据。

## 主要结果

FVC 空间图以 0—1 连续色标呈现覆盖度差异：绿洲耕地覆盖度较高，山区分布自然植被，荒漠区覆盖度较低。

五类分类区分水域与冰雪、自然植被、非小麦耕地、荒漠与建筑、小麦；局部结果与原始影像、WorldCereal 对照。2023 年总体精度按论文报告为 96%，Kappa 为 0.96。

## 图示

![艾比湖流域研究范围、艾比湖与赛里木湖及其在新疆的位置](vegetation/研究区域第二版_line300.jpg "艾比湖流域研究区域与地理位置")
![艾比湖流域植被覆盖度空间分布，连续色标范围为 0 到 1](vegetation/空间分布scalebar_Colorbar300.jpg "植被覆盖度 FVC 的空间差异")
![水域与冰雪、自然植被、非小麦耕地、荒漠与建筑、小麦的五类分类结果](vegetation/class500_legend.jpg "融合物候、地形与纹理的五类地物分类")
![局部原始遥感影像、WorldCereal 耕地产品与本研究分类结果对比](vegetation/Class对比.jpg "原始影像、WorldCereal 与本研究分类对比")
