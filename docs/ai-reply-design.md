# 🤖 闲鱼IM客户端AI智能回复方案设计文档

> **版本**: v1.1  
> **创建时间**: 2025年1月  
> **更新时间**: 2025年1月  

## 📋 目录

- [1. 方案概述](#1-方案概述)
- [2. 需求分析](#2-需求分析) 
- [3. AI方案选型对比](#3-ai方案选型对比)
- [4. 核心设计原则](#4-核心设计原则)
- [5. 技术架构设计](#5-技术架构设计)
- [6. 功能模块详细设计](#6-功能模块详细设计)
- [7. 数据存储系统设计](#7-数据存储系统设计)
- [8. 配置系统设计](#8-配置系统设计)
- [9. 实现计划](#9-实现计划)
- [10. 附录：配置示例](#10-附录配置示例)

---

## 1. 方案概述

### 1.1 项目背景
- **项目名称**: 闲鱼IM客户端AI智能回复系统
- **技术栈**: Electron + Vue3 + TypeScript + Node.js
- **业务场景**: 10年经验技术人员在闲鱼接外包项目
- **核心目标**: 通过AI实现智能需求挖掘，提高接单转化率

### 1.2 业务目标
- 🎯 **专业形象塑造**: 体现10年技术经验的专业咨询能力
- 📊 **需求挖掘**: 系统性收集客户项目需求，避免信息遗漏
- ⚡ **响应效率**: 7×24小时智能回复，不错过任何商机
- 💰 **转化率提升**: 预期客户转化率提升40%+

### 1.3 设计理念
```
AI智能判断类型 ➤ 收集需求+预算 ➤ 人工技术评估 ➤ 精准报价成交
```

---

## 2. 需求分析

### 2.1 核心需求
1. **智能客户识别**: AI能够判断商单/学生单类型，精准询问
2. **需求挖掘专业化**: 系统性收集项目需求和预算信息
3. **图片需求分析**: 支持分析客户发送的设计稿、原型图等
4. **回复简洁高效**: 每次回复控制在30字以内，直中要害
5. **个性化训练**: 基于实际对话效果持续优化回复策略
6. **避免直接报价**: AI不承担报价责任，避免估价风险

### 2.2 应用场景
- 📱 **项目咨询**: "能做个小程序吗？" → 判断类型+询问预算
- 🖼️ **需求图片**: 客户发送设计稿 → 分析需求+确认类型
- 💬 **技术咨询**: "小程序能对接微信支付吗？" → 确认可行+收集需求
- 💰 **价格询问**: "大概多少钱？" → 收集完整需求后转人工
- 🔧 **功能确认**: "需要支持哪些功能？" → 详细功能收集
- 🎓 **类型判断**: 区分商单/学生单，调整沟通策略

---

## 3. AI方案选型对比

### 3.1 候选方案

| 对比维度 | Coze Agent | Google Gemini | 选择权重 |
|---------|-----------|---------------|----------|
| **角色扮演能力** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 20% |
| **技术理解能力** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 30% |
| **响应速度** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 15% |
| **稳定性保障** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 20% |
| **图像分析** | ⭐⭐ | ⭐⭐⭐⭐⭐ | 5% |
| **综合得分** | **3.4** | **4.3** | **100%** |

### 3.2 最终选择
**推荐方案**: **Google Gemini + 角色Prompt工程**

**核心理由**:
1. **技术匹配度高**: Gemini的逻辑推理能力更适合技术需求分析
2. **图像分析强**: Gemini Vision支持设计稿、原型图分析
3. **稳定性保障**: Google企业级基础设施，SLA可靠
4. **扩展性好**: 可升级到Gemini Pro，支持更复杂场景

---

## 4. 核心设计原则

### 4.1 AI职责定位
```yaml
AI的核心职责:
  ✅ 客户类型识别: 智能判断商单/学生单类型
  ✅ 需求挖掘专家: 层层深入了解客户真实需求
  ✅ 预算信息收集: 询问并记录客户预算范围
  ✅ 技术顾问角色: 帮客户理清技术实现思路  
  ✅ 信息收集器: 为后续人工报价提供完整素材
  ✅ 图片分析师: 理解设计稿和需求文档

AI的职责边界:
  ❌ 不直接报价: 避免AI估价不准确的风险
  ❌ 不承诺工期: 避免无法履约的风险
  ❌ 不做技术决策: 避免技术方案错误
  ❌ 不拒绝学生单: 所有类型客户都正常接待
```

### 4.2 回复风格原则
- **简洁高效**: 每次回复30字以内，1-2句话
- **智能判断优先**: 先分析客户类型，再针对性提问
- **专业友好**: 体现10年技术经验，但不傲慢
- **目标导向**: 每次回复都要推进需求收集进展
- **类型标识**: 明确区分商单/学生单，便于后续处理
- **预算优先**: 早期就收集预算信息，便于技术评估

### 4.3 需求收集策略
```
类型判断(优先) → 预算询问(必须) → 业务需求(40%) → 功能需求(30%) → 技术需求(20%) → 项目需求(10%)
```

### 4.4 智能判断策略

#### 客户类型识别算法
```yaml
商单特征:
  关键词: ["公司", "企业", "商城", "管理系统", "正式项目", "商用"]
  语气特点: 正式、商务化表达
  需求特点: 功能复杂、有具体业务场景
  预算范围: 通常较高，5K以上

学生单特征:
  关键词: ["毕业设计", "作业", "课程设计", "demo", "简单的"]
  语气特点: 随意、学生化用词
  需求特点: 功能简单、演示性质
  预算范围: 通常较低，5K以下

不确定类型:
  特征不明显时，通过询问用途来判断
```

---

## 5. 技术架构设计

### 5.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    闲鱼IM客户端主程序                          │
├─────────────────────────────────────────────────────────────┤
│  消息处理层 (msg.service.ts)                                  │
│  ├── TextMsgHandler     ├── ImageMsgHandler                  │
├─────────────────────────────────────────────────────────────┤
│  AI回复服务层                                                │
│  ├── AIReplyService     ├── ImageAnalyzer                    │
│  ├── RequirementEngine  ├── ReplyGenerator                   │
├─────────────────────────────────────────────────────────────┤
│  配置管理层                                                  │
│  ├── PromptConfig      ├── TrainingSystem                    │
│  ├── ScenarioManager   ├── ConfigStorage                     │
├─────────────────────────────────────────────────────────────┤
│  外部API层                                                   │
│  ├── Gemini API       ├── Gemini Vision API                 │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 核心服务类设计

```typescript
// AI回复服务主类
export class AIReplyService {
  private promptConfig: AIPromptConfig;
  private requirementEngine: RequirementDiggingEngine;
  private imageAnalyzer: ImageRequirementAnalyzer;
  private replyGenerator: ConciseReplyGenerator;
  
  async handleTextMessage(msg: MsgFormattedPayload): Promise<string>
  async handleImageMessage(msg: MsgFormattedPayload): Promise<string>
}

// 需求挖掘引擎
export class RequirementDiggingEngine {
  generateNextQuestions(userResponse: string): string[]
  isRequirementComplete(): boolean
  generateRequirementSummary(): string
}

// 图片需求分析器
export class ImageRequirementAnalyzer {
  async analyzeRequirementImage(imageUrl: string): Promise<string>
}

// 简洁回复生成器
export class ConciseReplyGenerator {
  async generateReply(context: ReplyContext): Promise<string>
}
```

---

## 6. 功能模块详细设计

### 6.1 需求挖掘分层模型

```typescript
interface RequirementDiggingFlow {
  // 第一层：业务需求 (权重40%)
  businessLayer: {
    projectType: string;      // 项目类型: 小程序/App/网站等
    targetAudience: string;   // 目标用户: C端/B端/内部系统
    coreFeatures: string[];   // 核心功能: 支付/会员/商城等
    businessGoal: string;     // 商业目标: 获客/效率/品牌等
  };
  
  // 第二层：功能需求 (权重30%)
  functionalLayer: {
    userRoles: string[];      // 用户角色: 管理员/普通用户等
    workflows: string[];      // 业务流程: 注册/下单/支付等
    dataFlow: string[];       // 数据流转: 数据来源/存储/同步
    integrations: string[];   // 第三方集成: 微信/支付宝/ERP等
  };
  
  // 第三层：技术需求 (权重20%)
  technicalLayer: {
    platform: string[];       // 平台要求: iOS/Android/Web等
    performance: string[];    // 性能要求: 并发/响应时间等
    security: string[];       // 安全要求: 权限/加密/审计等
    scalability: string;      // 扩展性: 用户量/数据量预期
  };
  
  // 第四层：项目需求 (权重10%)
  projectLayer: {
    timeline: string;         // 时间要求: 紧急程度/里程碑
    budget: string;          // 预算范围: 大概区间
    team: string;            // 团队配合: 设计/测试支持
    maintenance: string;      // 后期维护: 运维/迭代需求
  };
}
```

### 6.2 场景化回复策略

```typescript
interface ScenarioPrompts {
  // 初始咨询阶段
  initial: {
    prompt: "客户刚开始咨询，需要了解项目类型和核心需求";
    questions: ["具体要做什么类型的项目？", "主要解决什么业务问题？", "预期的用户群体？"];
    maxQuestions: 3;
  };
  
  // 功能深挖阶段  
  functional: {
    prompt: "深入了解功能细节和业务流程";
    questions: ["用户主要操作流程？", "数据如何产生和流转？", "需要对接外部系统吗？"];
    maxQuestions: 2;
  };
  
  // 技术评估阶段
  technical: {
    prompt: "收集技术实现相关信息";
    questions: ["有特定技术栈要求吗？", "性能安全有特殊要求吗？"];
    maxQuestions: 2;
  };
  
  // 项目收尾阶段
  project: {
    prompt: "了解项目管理相关信息";
    questions: ["时间节点和紧急程度？", "大概预算范围？"];
    maxQuestions: 2;
  };
}
```

### 6.3 图片需求分析功能

```typescript
export class ImageRequirementAnalyzer {
  // 支持的图片类型
  supportedImageTypes = [
    'UI设计稿',      // Figma/Sketch导出图
    '原型图',        // 墨刀/Axure等原型
    '需求文档截图',   // Word/PDF截图  
    '流程图',        // 业务流程/架构图
    '手绘草图',      // 手写需求草图
    '聊天记录',      // 微信群聊需求讨论
  ];
  
  async analyzeRequirementImage(imageUrl: string, textContext?: string): Promise<{
    projectType: string;        // 识别的项目类型
    coreFeatures: string[];     // 提取的核心功能
    technicalPoints: string[];  // 技术难点
    clarificationNeeded: string[]; // 需要澄清的问题
    confidence: number;         // 分析置信度
  }> {
    const prompt = `
分析这张需求图片，提取关键信息：

请简洁总结：
1. 项目类型和核心功能 (一句话)
2. 主要技术难点 (如果有，最多2个)
3. 需要确认的关键问题 (最多3个，每个不超过15字)

要求：回复简洁专业，总字数不超过100字
    `;
    
    return await this.callGeminiVision(imageUrl, prompt, textContext);
  }
}
```

### 6.4 简洁回复生成机制

```typescript
export class ConciseReplyGenerator {
  private replyTemplates = {
    // 确认能力 + 关键问题
    capability_questions: "{能力确认}。{关键问题1}？{关键问题2}？",
    
    // 需求理解 + 澄清
    understanding_clarification: "明白，{需求总结}。{澄清问题}？",
    
    // 技术可行 + 细节
    feasibility_details: "技术上可以实现。{实现要点}，{细节问题}？",
    
    // 收集完成 + 后续步骤
    completion_next: "需求了解得差不多了，{总结}，{后续步骤}。"
  };
  
  // 强制长度控制
  private enforceLength(reply: string, maxLength: number = 50): string {
    if (reply.length <= maxLength) return reply;
    
    // 智能截断，保持语义完整
    const sentences = reply.split(/[。！？]/);
    let result = sentences[0];
    
    for (let i = 1; i < sentences.length; i++) {
      const candidate = result + sentences[i] + '。';
      if (candidate.length <= maxLength) {
        result = candidate;
      } else {
        break;
      }
    }
    
    return result.endsWith('。') ? result : result + '。';
  }
}
```

### 6.5 个性化训练系统

```typescript
export class PersonalizedTrainingSystem {
  // 真实对话案例库
  private trainingCases: TrainingCase[] = [];
  
  interface TrainingCase {
    clientMessage: string;      // 客户消息
    context: string;           // 对话上下文
    myReply: string;           // 我的回复
    clientResponse: string;    // 客户反馈
    result: 'positive' | 'neutral' | 'negative'; // 效果评价
    scenario: string;          // 场景标签
    timestamp: number;         // 时间戳
  }
  
  // 添加成功案例
  addTrainingCase(case: TrainingCase) {
    this.trainingCases.push(case);
    this.optimizePromptPattern();
  }
  
  // 基于成功案例生成Few-shot prompt
  generateFewShotPrompt(scenario: string): string {
    const successCases = this.trainingCases
      .filter(c => c.scenario === scenario && c.result === 'positive')
      .slice(-3); // 取最近3个成功案例
    
    return `参考这些成功回复风格：\n${successCases.map(c => `
客户：${c.clientMessage}
我的回复：${c.myReply}
效果：${c.clientResponse}
`).join('\n')}`;
  }
}
```

### 6.6 图片案例训练系统

```typescript
// 图片训练案例结构
interface ImageTrainingCase {
  caseId: string;
  imageUrl: string;                    // 聊天截图路径
  extractedContent: {
    clientMessages: string[];          // 客户消息内容
    aiReplies: string[];              // AI回复内容
    conversationFlow: ConversationStep[];
  };
  analysis: {
    clientType: 'business' | 'student'; // 客户类型分析
    successFactors: string[];           // 成功因素
    failurePoints: string[];           // 失败原因
    keyTurningPoints: string[];        // 关键转折点
  };
  outcome: 'success' | 'failure';      // 最终结果
  tags: string[];                      // 标签分类
}

// 图片案例管理器
export class ImageCaseTrainer {
  // 添加图片训练案例
  async addImageCase(imageFile: string, caseInfo: Partial<ImageTrainingCase>) {
    // 1. 使用Gemini Vision分析图片
    const extractedContent = await this.extractConversationFromImage(imageFile);
    
    // 2. 分析对话模式
    const analysis = await this.analyzeConversationPattern(extractedContent);
    
    // 3. 存储案例
    const trainingCase: ImageTrainingCase = {
      caseId: generateId(),
      imageUrl: imageFile,
      extractedContent,
      analysis,
      ...caseInfo
    };
    
    await this.storageService.saveCase(trainingCase);
  }
  
  // 从图片提取对话内容
  private async extractConversationFromImage(imageUrl: string): Promise<ConversationContent> {
    const prompt = `
分析这张聊天截图，提取完整对话内容：

请按时间顺序提取：
1. 客户的每条消息
2. 我方的每条回复
3. 对话的关键转折点
4. 客户的情绪变化

格式要求：
- 保持原始用词
- 标注消息时间（如果可见）
- 识别是否为商单/学生单
    `;
    
    return await this.geminiVision.analyze(imageUrl, prompt);
  }
  
  // 基于图片案例生成Few-shot prompt
  generateFewShotFromImages(scenario: string): string {
    const relevantImageCases = this.getImageCasesByScenario(scenario);
    
    return `
参考这些成功的真实对话案例：

${relevantImageCases.map(case => `
案例${case.caseId}:
${case.extractedContent.conversationFlow.map(step => `
客户: ${step.clientMessage}
我的回复: ${step.aiReply}
效果: ${step.clientResponse}
`).join('')}
结果: ${case.outcome} 
关键成功因素: ${case.analysis.successFactors.join('、')}
---
`).join('')}

现在请用类似成功模式回复当前客户:
    `;
  }
}
```

---

## 7. 数据存储系统设计

### 7.1 存储架构概述

```typescript
// 使用项目现有的electron-store + SQLite组合
export class AITrainingDataStorage {
  private configStore: Store;          // electron-store (配置数据)
  private caseDatabase: Database;      // sqlite3 (训练案例)
  
  constructor() {
    // 配置存储 (轻量数据)
    this.configStore = new Store({
      name: 'ai-training-config',
      defaults: {
        promptConfig: defaultPromptConfig,
        trainingSettings: defaultTrainingSettings
      }
    });
    
    // 案例数据库 (大量结构化数据)
    this.caseDatabase = new sqlite3.Database(
      path.join(app.getPath('userData'), 'ai-training-cases.db')
    );
    
    this.initDatabase();
  }
}
```

### 7.2 数据库表结构

```sql
-- 训练案例表
CREATE TABLE training_cases (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,              -- 'text' | 'image' | 'mixed'
  scenario TEXT NOT NULL,          -- 场景类型
  client_type TEXT NOT NULL,       -- 'business' | 'student' | 'unclear'
  conversation_data TEXT NOT NULL, -- JSON格式的对话数据
  analysis_data TEXT NOT NULL,     -- JSON格式的分析数据
  outcome TEXT NOT NULL,           -- 'success' | 'failure'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 图片案例表
CREATE TABLE image_cases (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,           -- 关联training_cases表
  image_path TEXT NOT NULL,        -- 本地图片路径
  image_hash TEXT NOT NULL,        -- 图片哈希值(防重复)
  extracted_content TEXT NOT NULL, -- 提取的文本内容
  FOREIGN KEY (case_id) REFERENCES training_cases(id)
);

-- 效果统计表
CREATE TABLE training_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prompt_version TEXT NOT NULL,
  success_rate REAL NOT NULL,
  avg_response_quality REAL NOT NULL,
  measured_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 7.3 文件存储结构

```
AppData/Roaming/xianyu-im/
├── ai-training-config.json        # electron-store配置
├── ai-training-cases.db           # SQLite训练案例数据库
└── training-assets/               # 训练素材目录
    ├── images/                    # 聊天截图
    │   ├── success/              # 成功案例图片
    │   ├── failure/              # 失败案例图片  
    │   └── mixed/                # 混合结果图片
    ├── prompts/                  # 历史Prompt版本
    │   ├── v1.0.json
    │   ├── v1.1.json
    │   └── current.json
    └── exports/                  # 导出备份
        ├── cases-backup-20250101.json
        └── full-backup-20250101.zip
```

### 7.4 图片案例存储实现

```typescript
export class AITrainingStorage {
  // 保存图片案例
  async saveImageCase(imageFile: File, caseData: ImageTrainingCase): Promise<string> {
    try {
      // 1. 生成唯一ID和哈希
      const caseId = uuidv4();
      const imageHash = await this.calculateFileHash(imageFile);
      
      // 2. 检查重复图片
      const existingCase = await this.findCaseByImageHash(imageHash);
      if (existingCase) {
        throw new Error('图片案例已存在');
      }
      
      // 3. 保存图片文件
      const imagePath = await this.saveImageFile(imageFile, caseId);
      
      // 4. 保存案例数据
      await this.database.run(`
        INSERT INTO training_cases 
        (id, type, scenario, client_type, conversation_data, analysis_data, outcome)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        caseId,
        'image',
        caseData.scenario,
        caseData.clientType,
        JSON.stringify(caseData.conversationData),
        JSON.stringify(caseData.analysis),
        caseData.outcome
      ]);
      
      // 5. 保存图片关联
      await this.database.run(`
        INSERT INTO image_cases 
        (id, case_id, image_path, image_hash, extracted_content)
        VALUES (?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        caseId, 
        imagePath,
        imageHash,
        JSON.stringify(caseData.extractedContent)
      ]);
      
      return caseId;
    } catch (error) {
      console.error('保存图片案例失败:', error);
      throw error;
    }
  }

  // 获取训练案例用于Few-shot
  async getTrainingCases(filters: {
    scenario?: string;
    clientType?: string;
    outcome?: string;
    limit?: number;
  }): Promise<TrainingCase[]> {
    let query = 'SELECT * FROM training_cases WHERE 1=1';
    const params: any[] = [];
    
    if (filters.scenario) {
      query += ' AND scenario = ?';
      params.push(filters.scenario);
    }
    
    if (filters.clientType) {
      query += ' AND client_type = ?';
      params.push(filters.clientType);
    }
    
    if (filters.outcome) {
      query += ' AND outcome = ?';
      params.push(filters.outcome);
    }
    
    query += ' ORDER BY created_at DESC';
    
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
    }
    
    const rows = await this.database.all(query, params);
    return rows.map(row => ({
      ...row,
      conversationData: JSON.parse(row.conversation_data),
      analysisData: JSON.parse(row.analysis_data)
    }));
  }
}
```

### 7.5 数据备份和同步

```typescript
export class AIDataBackup {
  // 导出所有训练数据
  async exportTrainingData(): Promise<string> {
    const timestamp = new Date().toISOString().slice(0, 10);
    const exportPath = path.join(
      app.getPath('userData'), 
      'training-assets/exports',
      `training-data-${timestamp}.json`
    );
    
    const data = {
      cases: await this.storage.getAllCases(),
      configs: await this.configManager.getAllConfigs(),
      metrics: await this.storage.getMetrics(),
      exportedAt: new Date().toISOString()
    };
    
    await fs.writeFile(exportPath, JSON.stringify(data, null, 2));
    return exportPath;
  }
  
  // 导入训练数据
  async importTrainingData(filePath: string): Promise<void> {
    const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
    
    // 批量导入案例
    for (const case_ of data.cases) {
      await this.storage.importCase(case_);
    }
    
    // 导入配置
    for (const [version, config] of Object.entries(data.configs)) {
      await this.configManager.savePromptConfig(config, version);
    }
  }
}
```

### 7.6 推荐的图片案例收集策略

```yaml
成功案例截图:
  - ✅ 从询问到成交的完整对话
  - ✅ 预算谈妥的关键转折点
  - ✅ 客户主动提供详细需求的对话
  - ✅ 处理价格异议的成功案例

失败案例截图:
  - ❌ 客户流失的对话记录
  - ❌ 价格谈崩的案例
  - ❌ 回复不当导致的问题
  - ❌ 误判客户类型的教训

特殊场景截图:
  - 🖼️ 客户发图片需求的处理方式
  - 💰 复杂预算谈判的过程
  - 🔄 需求变更的应对策略
  - ⚡ 紧急项目的快速响应

收集建议:
  - 定期截图保存成功对话
  - 按场景分类存储（商单/学生单/图片需求等）
  - 记录每个案例的关键成功点
  - 定期分析失败案例的原因

训练频率:
  - 每周添加2-3个新案例
  - 每月分析一次案例模式
  - 季度更新Prompt策略
  - 持续优化回复模板
```

---

## 8. 配置系统设计

### 8.1 Prompt配置管理

```typescript
export interface AIPromptConfig {
  // 基础角色设定
  systemPrompt: string;
  
  // 场景化提示词
  scenarioPrompts: {
    initial: string;      // 初始咨询
    functional: string;   // 功能深挖  
    technical: string;    // 技术评估
    project: string;      // 项目收尾
    pricing: string;      // 价格询问
  };
  
  // 个人信息模板
  personalInfo: {
    experience: string;           // "10年全栈开发经验"
    techStack: string[];         // ["Vue", "React", "Node.js"]
    specialties: string[];       // ["小程序", "电商系统"]
    workStyle: string;           // "重视质量和交付"
    availability: string;        // "档期相对宽松"
  };
  
  // 回复风格控制
  replyStyle: {
    maxLength: number;           // 最大字符数限制
    tone: 'professional' | 'friendly' | 'casual'; // 语气风格
    questionStrategy: 'focused' | 'comprehensive'; // 提问策略
  };
}
```

### 8.2 可视化配置界面

```vue
<!-- AI配置管理页面 -->
<template>
  <div class="ai-config-panel">
    <!-- 基础角色设定 -->
    <el-card title="角色设定">
      <el-input 
        type="textarea" 
        v-model="config.systemPrompt"
        :rows="8"
        placeholder="设定AI的基本角色、经验背景和沟通风格..."
      />
    </el-card>
    
    <!-- 个人信息配置 -->
    <el-card title="个人信息">
      <el-form label-width="100px">
        <el-form-item label="经验描述">
          <el-input v-model="config.personalInfo.experience" />
        </el-form-item>
        <el-form-item label="技术栈">
          <el-select v-model="config.personalInfo.techStack" multiple>
            <el-option value="Vue" label="Vue.js" />
            <el-option value="React" label="React" />
            <el-option value="Node.js" label="Node.js" />
            <!-- 更多技术选项 -->
          </el-select>
        </el-form-item>
        <el-form-item label="专长领域">
          <el-checkbox-group v-model="config.personalInfo.specialties">
            <el-checkbox label="小程序开发" />
            <el-checkbox label="电商系统" />
            <el-checkbox label="管理系统" />
            <!-- 更多专长选项 -->
          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 场景回复配置 -->
    <el-card title="场景回复策略">
      <el-tabs>
        <el-tab-pane label="初始咨询" name="initial">
          <el-input 
            type="textarea" 
            v-model="config.scenarioPrompts.initial"
            placeholder="客户初次咨询时的回复策略..." 
          />
        </el-tab-pane>
        <el-tab-pane label="功能深挖" name="functional">
          <el-input 
            type="textarea" 
            v-model="config.scenarioPrompts.functional"
            placeholder="深入了解功能需求时的策略..." 
          />
        </el-tab-pane>
        <!-- 其他场景标签页 -->
      </el-tabs>
    </el-card>
    
    <!-- 回复效果测试 -->
    <el-card title="回复效果测试">
      <el-input 
        v-model="testMessage" 
        placeholder="输入测试消息，看AI如何回复..."
        @keyup.enter="testReply"
      />
      <el-button type="primary" @click="testReply">测试回复</el-button>
      
      <div v-if="testResult" class="test-result">
        <h4>AI回复预览：</h4>
        <p>{{ testResult.reply }}</p>
        <p><small>字数：{{ testResult.length }}/50</small></p>
      </div>
    </el-card>
    
    <!-- 配置操作 -->
    <div class="config-actions">
      <el-button type="primary" @click="saveConfig">保存配置</el-button>
      <el-button @click="resetConfig">重置默认</el-button>
      <el-button @click="exportConfig">导出配置</el-button>
      <el-button @click="importConfig">导入配置</el-button>
    </div>
  </div>
</template>
```

---

## 9. 实现计划

### 9.1 开发阶段规划

#### Phase 1: 基础框架搭建 (2天)
- ✅ 创建 `AIReplyService` 核心服务类
- ✅ 集成 Gemini API 调用封装
- ✅ 实现基础的文本消息处理
- ✅ 添加简单的配置管理

#### Phase 2: 需求挖掘引擎 (2天)
- ✅ 实现 `RequirementDiggingEngine` 
- ✅ 设计分层需求收集模型
- ✅ 开发场景识别和问题生成逻辑
- ✅ 添加需求完整度判断机制

#### Phase 3: 图片分析功能 (1天)
- ✅ 集成 Gemini Vision API
- ✅ 实现 `ImageRequirementAnalyzer`
- ✅ 添加图片下载和处理逻辑
- ✅ 优化图片分析的Prompt

#### Phase 4: 配置界面开发 (1.5天)
- ✅ 创建AI配置管理页面
- ✅ 实现Prompt可视化编辑
- ✅ 添加实时预览功能
- ✅ 完成配置导入导出

#### Phase 5: 个性化训练 (1.5天)
- ✅ 实现训练案例收集系统
- ✅ 开发Few-shot prompt生成
- ✅ 添加效果评估和优化机制
- ✅ 建立案例数据持久化

### 9.2 技术实现要点

```typescript
// 关键技术决策
const implementationDecisions = {
  // API调用封装
  apiClient: {
    provider: 'Google Gemini',
    model: 'gemini-1.5-pro',
    fallback: 'gemini-1.5-flash', // 降级方案
    timeout: 10000,
    retryTimes: 3,
  },
  
  // 数据存储
  storage: {
    config: 'electron-store',     // 配置持久化
    training: 'sqlite3',          // 训练数据
    cache: 'memory + file',       // 缓存策略
  },
  
  // 错误处理
  errorHandling: {
    apiFailure: '使用预设回复',
    networkError: '缓存最近回复',
    parseError: '请求人工介入',
  },
};
```

### 9.3 测试验证方案

#### 单元测试
- AI服务类的方法测试
- 需求挖掘引擎的逻辑测试  
- 配置管理的读写测试
- 图片分析的准确性测试

#### 集成测试
- 端到端消息处理流程
- Gemini API集成稳定性
- 配置界面的交互测试
- 性能和响应时间测试

#### 用户验收测试
- 真实场景的回复效果
- 客户体验和转化率
- 长期使用的稳定性
- 配置调优的便利性

---

## 10. 附录：配置示例

### 10.1 智能客户识别配置

```typescript
const clientTypeConfig = {
  // 高置信度商单回复
  businessReply: {
    highConfidence: "可以做，预算大概多少？{question}？",
    examples: [
      {
        input: "公司要做个电商系统",
        output: "可以做，预算大概多少？主要功能有哪些？",
        length: 23
      }
    ]
  },
  
  // 高置信度学生单回复
  studentReply: {
    highConfidence: "可以做，预算多少？{question}？",
    examples: [
      {
        input: "毕业设计要做个简单网站",
        output: "可以做，预算多少？具体什么功能？", 
        length: 18
      }
    ]
  },
  
  // 不确定类型回复
  unclearReply: {
    template: "可以做，这是什么用途的？预算多少？",
    examples: [
      {
        input: "能做个小程序吗？",
        output: "可以做，这是什么用途的？预算多少？",
        length: 19
      }
    ]
  }
};
```

### 10.2 10T技术人员角色Prompt

```typescript
const defaultSystemPrompt = `
你是一名拥有10年经验的全栈开发工程师，专门在闲鱼接外包项目。

## 角色背景
- **技术功底**: 前端(Vue/React/小程序)、后端(Node.js/Java/Python)、数据库都很精通
- **项目经验**: 独立完成200+项目，涵盖电商、管理系统、小程序等各个领域  
- **工作风格**: 注重需求理解、重视项目质量、按时交付、价格公道合理

## 沟通原则
1. **先确认能力**: "可以做的，我有X年相关经验"
2. **深入了解需求**: 通过2-3个关键问题了解项目细节
3. **展示专业度**: 提及相关技术点，但用客户能理解的语言
4. **不直接报价**: 说需要详细评估后给准确报价

## 回复要求
- 每次回复控制在50字以内，最多2句话
- 语气专业友好，不傲慢不谦卑
- 每次回复要推进需求收集进展
- 遇到价格询问时，说明需要技术评估后报价

## 角色禁忌
❌ 不要直接给价格或价格区间
❌ 不要承诺具体的开发周期
❌ 不要使用过于技术化的专业术语
❌ 不要一次问太多问题（最多3个）
`;
```

### 10.3 场景化回复示例

```typescript
const scenarioExamples = {
  // 项目咨询场景
  projectInquiry: {
    input: "能做个小程序吗？",
    output: "可以的，小程序开发是我的专长。主要做什么功能？有设计稿吗？",
    analysis: "确认能力 + 2个关键问题，字数45字符"
  },
  
  // 图片需求场景
  imageRequirement: {
    input: "[图片：电商小程序原型图]",
    imageAnalysis: "电商小程序，包含商品浏览、购物车、订单管理功能",
    output: "原型很清楚，功能挺全的。商品数据从哪来？支付用什么？",
    analysis: "认可设计 + 2个核心问题，字数38字符"
  },
  
  // 技术咨询场景
  technicalQuestion: {
    input: "小程序能对接微信支付吗？",
    output: "完全可以，我对接过很多次。还需要其他支付方式吗？",
    analysis: "确认可行性 + 扩展询问，字数32字符"
  },
  
  // 价格询问场景
  pricingRequest: {
    input: "大概多少钱？",
    output: "需求了解得差不多了，我评估下技术方案，明天给您详细报价。",
    analysis: "避免直接报价 + 说明后续流程，字数40字符"
  },
  
  // 复杂需求场景
  complexRequirement: {
    input: "要做个类似美团的外卖平台",
    output: "可以做，这类平台我有经验。用户端还是商家端？需要配送功能吗？",
    analysis: "确认能力 + 范围澄清，字数39字符"
  }
};
```

### 10.4 需求挖掘问题库

```typescript
const questionBank = {
  // 业务需求层面
  businessQuestions: [
    "具体要解决什么业务问题？",
    "主要的目标用户是谁？",
    "预期达到什么效果？",
    "有参考的产品或竞品吗？",
    "是新业务还是现有业务？"
  ],
  
  // 功能需求层面  
  functionalQuestions: [
    "用户主要会做哪些操作？",
    "需要哪些核心功能模块？",
    "数据从哪里来？怎么管理？",
    "需要对接外部系统吗？",
    "有权限管理要求吗？"
  ],
  
  // 技术需求层面
  technicalQuestions: [
    "有特定的技术栈要求吗？",
    "对性能有什么要求？",
    "需要考虑多少用户量？",
    "有安全要求吗？",
    "需要考虑扩展性吗？"
  ],
  
  // 项目需求层面
  projectQuestions: [
    "项目的时间节点？",
    "大概的预算范围？",
    "需要设计支持吗？",
    "后期维护怎么安排？",
    "团队配合方式？"
  ]
};
```

### 10.5 训练案例模板

```typescript
const trainingCaseTemplate = {
  // 成功案例1: 电商小程序
  case1: {
    scenario: 'ecommerce_miniprogram',
    conversation: [
      {
        client: "想做个卖农产品的小程序",
        ai: "可以的，农产品电商我做过几个。主要卖什么品类？需要配送功能吗？",
        result: "positive",
        note: "客户继续详细描述需求"
      },
      {
        client: "主要卖水果，需要同城配送",
        ai: "明白了，水果电商对时效要求高。用户量预期多少？有库存管理需求吗？", 
        result: "positive",
        note: "客户提供了用户量和库存信息"
      }
    ]
  },
  
  // 成功案例2: 管理系统
  case2: {
    scenario: 'management_system',
    conversation: [
      {
        client: "[图片：CRM系统原型图]",
        ai: "CRM系统原型很详细。主要管理多少客户？需要对接其他系统吗？",
        result: "positive", 
        note: "客户说明了客户规模和集成需求"
      }
    ]
  }
};
```

---

## 📝 版本更新记录

| 版本 | 日期 | 更新内容 | 作者 |
|------|------|----------|------|
| v1.0 | 2025-01 | 初始版本，完整设计方案 | Developer |

---

## 🔗 相关文档

- [项目README](../README.md)
- [开发指南](./development-guide.md) 
- [API文档](./api-documentation.md)
- [部署指南](./deployment-guide.md)

---

**📧 联系方式**: 如有问题或建议，请通过项目Issue反馈