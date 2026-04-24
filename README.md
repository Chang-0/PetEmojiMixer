# Pet-Emoji Mixer

一个可以让你把宠物和 Emoji 结合起来的趣味网站。

## 快速开始

### 1. 启动后端 (Spring Boot)
你需要安装 Java 17+ 和 Maven。
```bash
cd backend
mvn spring-boot:run
```
后端将运行在 `http://localhost:8080`。

### 2. 启动前端 (React + Vite)
你需要安装 Node.js。
```bash
cd frontend
npm install  # 如果还没安装依赖
npm run dev
```
前端将运行在 `http://localhost:5173`。

## 功能介绍
- **选择宠物**: 点击左侧边栏切换不同的基础宠物模型。
- **添加 Emoji**: 点击右侧边栏将有趣的 Emoji 添加到画布。
- **编辑**: 在画布上自由拖拽、缩放、旋转 Emoji。
- **保存与导出**:
    - **Save**: 将当前的创作方案保存到后端数据库。
    - **Export PNG**: 将生成的作品导出为本地图片。

## 技术栈
- **前端**: React, TypeScript, Konva (Canvas 库)
- **后端**: Java, Spring Boot, Spring Data JPA, H2 Database
