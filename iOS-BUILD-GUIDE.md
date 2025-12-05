# 金融管家 iOS 原生 App 开发指南

## 技术栈

- **语言**：Swift 5
- **UI框架**：SwiftUI
- **最低支持**：iOS 16+
- **后端API**：https://money.linkmate.site/api/

---

## 准备工作

### 你需要的东西
| 项目 | 说明 | 必需？ |
|-----|------|-------|
| **Mac 电脑** | iOS 开发必须用 Mac | ✅ 必需 |
| **Xcode 15+** | 从 App Store 免费下载 | ✅ 必需 |
| **Apple ID** | 用于签名 | ✅ 必需 |
| **开发者账号** | 上架 App Store 需要（$99/年） | 可选 |

---

## 步骤一：创建 Xcode 项目

1. 打开 Xcode
2. 点击 **Create New Project**
3. 选择 **iOS** → **App**
4. 填写信息：
   - **Product Name**: `金融管家`
   - **Team**: 选择你的 Apple ID
   - **Organization Identifier**: `site.linkmate`
   - **Interface**: `SwiftUI`
   - **Language**: `Swift`
5. 选择保存位置，点击 **Create**

---

## 步骤二：项目结构

创建以下文件结构：

```
金融管家/
├── App/
│   └── 金融管家App.swift        # App入口
├── Models/
│   ├── Account.swift            # 账户模型
│   └── Transaction.swift        # 交易模型
├── Views/
│   ├── ContentView.swift        # 主视图（Tab导航）
│   ├── DashboardView.swift      # 首页
│   ├── HistoryView.swift        # 明细页
│   ├── StatisticsView.swift     # 统计页
│   └── TransactionSheet.swift   # 记一笔弹窗
├── Services/
│   └── APIService.swift         # API请求服务
└── Assets.xcassets/             # 图标和图片资源
```

---

## 步骤三：核心代码

### 1. 数据模型 `Models/Account.swift`

```swift
import Foundation

struct Account: Codable, Identifiable {
    let id: Int
    let name: String
    let nameCn: String
    var balance: Double
    let isDebt: Bool
    let icon: String
    let color: String
    
    enum CodingKeys: String, CodingKey {
        case id, name, balance, icon, color
        case nameCn = "name_cn"
        case isDebt = "is_debt"
    }
}

struct Transaction: Codable, Identifiable {
    let id: Int
    let accountId: Int
    let accountName: String
    let amount: Double
    let transactionType: String
    let note: String
    let createdAt: String
    
    enum CodingKeys: String, CodingKey {
        case id, amount, note
        case accountId = "account_id"
        case accountName = "account_name"
        case transactionType = "transaction_type"
        case createdAt = "created_at"
    }
}

struct Summary: Codable {
    let totalAssets: Double
    let totalDebt: Double
    let netWorth: Double
    let accounts: [Account]
    
    enum CodingKeys: String, CodingKey {
        case accounts
        case totalAssets = "total_assets"
        case totalDebt = "total_debt"
        case netWorth = "net_worth"
    }
}

struct APIResponse<T: Codable>: Codable {
    let success: Bool
    let data: T
}
```

### 2. API 服务 `Services/APIService.swift`

```swift
import Foundation

class APIService: ObservableObject {
    static let shared = APIService()
    private let baseURL = "https://money.linkmate.site/api"
    
    @Published var summary: Summary?
    @Published var isLoading = false
    
    // 获取汇总数据
    func fetchSummary() async {
        guard let url = URL(string: "\(baseURL)/summary") else { return }
        
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let response = try JSONDecoder().decode(APIResponse<Summary>.self, from: data)
            
            await MainActor.run {
                self.summary = response.data
            }
        } catch {
            print("Error fetching summary: \(error)")
        }
    }
    
    // 创建交易
    func createTransaction(accountId: Int, type: String, amount: Double, note: String) async -> Bool {
        guard let url = URL(string: "\(baseURL)/transactions") else { return false }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body: [String: Any] = [
            "account_id": accountId,
            "transaction_type": type,
            "amount": amount,
            "note": note
        ]
        
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        do {
            let (_, response) = try await URLSession.shared.data(for: request)
            return (response as? HTTPURLResponse)?.statusCode == 200
        } catch {
            print("Error creating transaction: \(error)")
            return false
        }
    }
}
```

### 3. 主视图 `Views/ContentView.swift`

```swift
import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            DashboardView()
                .tabItem {
                    Image(systemName: "house.fill")
                    Text("首页")
                }
                .tag(0)
            
            HistoryView()
                .tabItem {
                    Image(systemName: "clock.fill")
                    Text("明细")
                }
                .tag(1)
            
            StatisticsView()
                .tabItem {
                    Image(systemName: "chart.pie.fill")
                    Text("分析")
                }
                .tag(2)
        }
        .tint(.blue)
    }
}
```

### 4. 首页 `Views/DashboardView.swift`

```swift
import SwiftUI

struct DashboardView: View {
    @StateObject private var api = APIService.shared
    @State private var showTransactionSheet = false
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    // 净资产卡片
                    VStack(alignment: .leading, spacing: 8) {
                        Text("我的净资产")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                        
                        Text("¥\(api.summary?.netWorth ?? 0, specifier: "%.2f")")
                            .font(.system(size: 36, weight: .bold, design: .rounded))
                    }
                    .padding()
                    
                    // 资产/负债概览
                    HStack(spacing: 12) {
                        SummaryCard(
                            title: "总资产",
                            amount: api.summary?.totalAssets ?? 0,
                            color: .blue
                        )
                        SummaryCard(
                            title: "总负债",
                            amount: api.summary?.totalDebt ?? 0,
                            color: .red
                        )
                    }
                    .padding(.horizontal)
                    
                    // 资产账户
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text("资产账户")
                                .font(.headline)
                            Spacer()
                            Button("记一笔") {
                                showTransactionSheet = true
                            }
                            .buttonStyle(.borderedProminent)
                            .controlSize(.small)
                        }
                        
                        LazyVGrid(columns: [
                            GridItem(.flexible()),
                            GridItem(.flexible())
                        ], spacing: 12) {
                            ForEach(assetAccounts) { account in
                                AccountCard(account: account)
                            }
                        }
                    }
                    .padding(.horizontal)
                    
                    // 信用账户
                    VStack(alignment: .leading, spacing: 12) {
                        Text("信用账户")
                            .font(.headline)
                        
                        ForEach(debtAccounts) { account in
                            DebtCard(account: account)
                        }
                    }
                    .padding(.horizontal)
                }
                .padding(.bottom, 100)
            }
            .background(Color(.systemGroupedBackground))
            .refreshable {
                await api.fetchSummary()
            }
        }
        .sheet(isPresented: $showTransactionSheet) {
            TransactionSheet()
        }
        .task {
            await api.fetchSummary()
        }
    }
    
    var assetAccounts: [Account] {
        api.summary?.accounts.filter { !$0.isDebt } ?? []
    }
    
    var debtAccounts: [Account] {
        api.summary?.accounts.filter { $0.isDebt } ?? []
    }
}

// 汇总卡片
struct SummaryCard: View {
    let title: String
    let amount: Double
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Circle()
                    .fill(color.opacity(0.2))
                    .frame(width: 32, height: 32)
                    .overlay {
                        Image(systemName: color == .blue ? "arrow.up.right" : "arrow.down.right")
                            .font(.caption.bold())
                            .foregroundColor(color)
                    }
                Text(title)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            Text("¥\(amount, specifier: "%.0f")")
                .font(.title3.bold())
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
    }
}

// 账户卡片
struct AccountCard: View {
    let account: Account
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            AccountIcon(name: account.name)
                .frame(width: 40, height: 40)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(account.nameCn)
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text("¥\(account.balance, specifier: "%.0f")")
                    .font(.title3.bold())
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
    }
}

// 负债卡片
struct DebtCard: View {
    let account: Account
    
    var body: some View {
        HStack {
            AccountIcon(name: account.name)
                .frame(width: 44, height: 44)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(account.nameCn)
                    .font(.headline)
                Text("本月应还")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Text("-¥\(account.balance, specifier: "%.2f")")
                .font(.headline)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
    }
}

// 账户图标
struct AccountIcon: View {
    let name: String
    
    var iconInfo: (symbol: String, color: Color, bg: Color) {
        switch name {
        case "alipay": return ("yensign.circle.fill", .blue, .blue.opacity(0.1))
        case "wechat": return ("message.fill", .green, .green.opacity(0.1))
        case "icbc": return ("building.columns.fill", .red, .red.opacity(0.1))
        case "boc": return ("building.columns.fill", .red, .red.opacity(0.1))
        case "huabei": return ("creditcard.fill", .orange, .orange.opacity(0.1))
        case "jd_baitiao": return ("bag.fill", .red, .red.opacity(0.1))
        default: return ("wallet.pass.fill", .blue, .blue.opacity(0.1))
        }
    }
    
    var body: some View {
        RoundedRectangle(cornerRadius: 12)
            .fill(iconInfo.bg)
            .overlay {
                Image(systemName: iconInfo.symbol)
                    .foregroundColor(iconInfo.color)
            }
    }
}
```

### 5. 记一笔弹窗 `Views/TransactionSheet.swift`

```swift
import SwiftUI

struct TransactionSheet: View {
    @Environment(\.dismiss) var dismiss
    @StateObject private var api = APIService.shared
    
    @State private var selectedAccount: Account?
    @State private var transactionType: String = "decrease"
    @State private var amount: String = ""
    @State private var note: String = ""
    @State private var step = 1
    
    var body: some View {
        NavigationStack {
            VStack {
                if step == 1 {
                    // 选择账户
                    accountSelectionView
                } else if step == 2 {
                    // 选择类型
                    typeSelectionView
                } else {
                    // 输入金额
                    amountInputView
                }
            }
            .navigationTitle(stepTitle)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    if step > 1 {
                        Button("返回") { step -= 1 }
                    } else {
                        Button("取消") { dismiss() }
                    }
                }
            }
        }
    }
    
    var stepTitle: String {
        switch step {
        case 1: return "选择账户"
        case 2: return "收支类型"
        default: return "金额明细"
        }
    }
    
    var accountSelectionView: some View {
        ScrollView {
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                ForEach(api.summary?.accounts ?? []) { account in
                    Button {
                        selectedAccount = account
                        step = 2
                    } label: {
                        VStack(alignment: .leading, spacing: 8) {
                            AccountIcon(name: account.name)
                                .frame(width: 40, height: 40)
                            Text(account.nameCn)
                                .font(.headline)
                                .foregroundColor(.primary)
                            Text("¥\(account.balance, specifier: "%.0f")")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding()
                        .background(Color(.systemBackground))
                        .cornerRadius(16)
                    }
                }
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground))
    }
    
    var typeSelectionView: some View {
        VStack(spacing: 20) {
            if let account = selectedAccount {
                HStack {
                    AccountIcon(name: account.name)
                        .frame(width: 40, height: 40)
                    VStack(alignment: .leading) {
                        Text(account.nameCn)
                            .font(.headline)
                        Text("当前: ¥\(account.balance, specifier: "%.0f")")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(16)
            }
            
            HStack(spacing: 16) {
                Button {
                    transactionType = "increase"
                    step = 3
                } label: {
                    VStack(spacing: 12) {
                        Image(systemName: "plus.circle.fill")
                            .font(.largeTitle)
                        Text(selectedAccount?.isDebt == true ? "增加欠款" : "收入")
                            .font(.headline)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 30)
                    .background(Color.green.opacity(0.1))
                    .foregroundColor(.green)
                    .cornerRadius(20)
                }
                
                Button {
                    transactionType = "decrease"
                    step = 3
                } label: {
                    VStack(spacing: 12) {
                        Image(systemName: "minus.circle.fill")
                            .font(.largeTitle)
                        Text(selectedAccount?.isDebt == true ? "还款" : "支出")
                            .font(.headline)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 30)
                    .background(Color.red.opacity(0.1))
                    .foregroundColor(.red)
                    .cornerRadius(20)
                }
            }
            
            Spacer()
        }
        .padding()
        .background(Color(.systemGroupedBackground))
    }
    
    var amountInputView: some View {
        VStack(spacing: 24) {
            // 金额输入
            HStack(alignment: .center) {
                Text("¥")
                    .font(.system(size: 40, weight: .bold))
                    .foregroundColor(.secondary)
                TextField("0", text: $amount)
                    .font(.system(size: 50, weight: .bold, design: .rounded))
                    .keyboardType(.decimalPad)
                    .multilineTextAlignment(.leading)
            }
            .padding()
            
            // 备注
            TextField("写点什么备注...", text: $note)
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)
            
            Spacer()
            
            // 确认按钮
            Button {
                Task {
                    guard let account = selectedAccount,
                          let amountValue = Double(amount) else { return }
                    
                    let success = await api.createTransaction(
                        accountId: account.id,
                        type: transactionType,
                        amount: amountValue,
                        note: note
                    )
                    
                    if success {
                        await api.fetchSummary()
                        dismiss()
                    }
                }
            } label: {
                HStack {
                    Image(systemName: "checkmark")
                    Text("确认记一笔")
                }
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding()
                .background(amount.isEmpty ? Color.gray : Color.blue)
                .foregroundColor(.white)
                .cornerRadius(16)
            }
            .disabled(amount.isEmpty)
        }
        .padding()
        .background(Color(.systemGroupedBackground))
    }
}
```

---

## 步骤四：运行测试

1. 在 Xcode 顶部选择模拟器（如 iPhone 15 Pro）
2. 点击 ▶️ 运行
3. 测试各项功能是否正常

---

## 步骤五：安装到真机

1. 用数据线连接 iPhone 到 Mac
2. Xcode 顶部选择你的 iPhone
3. 点击 ▶️ 运行
4. 首次需要在 iPhone 上信任开发者

---

## 后续优化

- [ ] 添加 App 图标（1024x1024 PNG）
- [ ] 添加启动画面
- [ ] 添加本地数据缓存
- [ ] 添加下拉刷新动画
- [ ] 添加深色模式支持
- [ ] 添加 Widget 小组件

---

## API 接口参考

| 接口 | 方法 | 说明 |
|-----|------|-----|
| `/api/summary` | GET | 获取账户汇总 |
| `/api/transactions` | POST | 创建交易 |
| `/api/transactions/grouped` | GET | 获取分组交易记录 |
| `/api/statistics` | GET | 获取统计数据 |

---

## 常见问题

### Q: 网络请求失败
A: 检查 Info.plist 是否允许 HTTPS 请求（默认允许）

### Q: 真机运行失败
A: 检查签名配置，确保 Team 已选择

### Q: 7天后 App 失效
A: 免费账号限制，需要重新运行安装，或购买开发者账号
