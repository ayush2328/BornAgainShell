# 📁 Sample Assessment Datasets & Templates (SRMP Project)

These files contain structured cybersecurity risk assessment datasets aligned with **NIST CSF 2.0 (GV.SC)** and **NIST SP 800-161 Rev. 1**. You can edit them in any text editor, VS Code, or Excel, and upload them directly into the **Cybersecurity Assessment Wizard** in the web interface!

---

## 📄 Available Files in this Folder

| File Name | Format | Risk Profile | Purpose |
| :--- | :--- | :--- | :--- |
| **`assessment_template.json`** | JSON | Standard / High Risk | Full 10-domain questionnaire template with explanations. |
| **`assessment_template.csv`** | CSV | Standard | Open and edit in **Microsoft Excel**, **Google Sheets**, or **Apple Numbers**. |
| **`byteshield_critical_assessment.json`** | JSON | **Critical Risk (20/25)** | Shows **"Reject / Escalate"** decision with shared admin credentials and missing MFA. |
| **`payswift_compliant_assessment.json`** | JSON | **Low Risk (4/25)** | Shows **"Approve"** decision with SOC 2 & PCI-DSS compliance. |

---

## ✏️ How to Modify and Customize

### 1. In JSON Files:
Open any `.json` file. Each item in the `"answers"` array has:
* `"question_id"`: e.g. `"AC-01"`, `"DP-01"`, `"IR-01"`, etc.
* `"response"`: Choose from `"yes"`, `"partial"`, `"no"`, or `"na"`.
  * `"yes"` = Full control compliance (+weight)
  * `"partial"` = Partial implementation (50% score)
  * `"no"` = Security gap identified (raises Likelihood)
  * `"na"` = Not applicable to this vendor
* `"evidence"`: Your notes or auditor observations.

### 2. In CSV Files:
Open `assessment_template.csv` in Excel:
* Change the **Response** column to `yes`, `partial`, `no`, or `na`.
* Add custom **Evidence_Notes**.
* Save as CSV.

---

## 🚀 How to Upload into the Web App

1. Open **`http://localhost:5173`** in your browser.
2. Click on the **🛡️ Cybersecurity Assessment Wizard** tab.
3. Click the **"📁 Upload Assessment File"** button.
4. Select any `.json` or `.csv` file from this folder.
5. The web app will **instantaneously populate all answers, evidence notes, recalculate the Likelihood, Impact, and Inherent Risk Score, and update the 5×5 Matrix live!**
