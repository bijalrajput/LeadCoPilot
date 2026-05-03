# 🫀 LeadCoPilot

**LeadCoPilot** is a clinical assistant designed for systematic, step-by-step ECG interpretations. It guides clinicians through a comprehensive analysis workflow to ensure accuracy and consistency.

---

## 🚀 How to Use LeadCoPilot

To use the AI-powered features (Smart Import and Differential Diagnosis), you will need a **Gemini API Key**. 

1. **Get a Key**: You can get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. **Enter Key**: Paste your key into the **"Enter Gemini API Key"** field at the top of the app.
   * *Your key is never stored on a server; it is used only for requests made directly from your browser.*

---

## 🛠 The Workflow

LeadCoPilot follows a structured 7-step process to ensure a complete interpretation:

### 0. Smart Import (Optional)
Upload an image of an ECG and provide any clinical context. The AI will attempt to pre-fill the following steps for you to review.

### 1. Rate
Enter the heart rate in beats per minute (bpm). This value is used later for QTc calculations.

### 2. Rhythm
Identify the rhythm (Sinus, A-Fib, Junctional). If you are unsure, the app provides a guided checklist to help you determine regularity and the presence of P-waves.

### 3. Axis
Determine the cardiac axis. You can select it manually or use the built-in **Axis Calculator** by entering the QRS polarity in Leads I and aVF.

### 4. Intervals
Enter the PR, QRS, and QT intervals in milliseconds. LeadCoPilot includes a **QTc Calculator** using Bazett's formula based on your previously entered heart rate.

### 5. Morphology
A detailed review of the ECG's physical characteristics:
- **Voltages**: Assess for low voltage or LVH.
- **P-Waves**: Check for enlargement or biphasic morphology.
- **Q-Waves**: Identify pathologic Q-waves in specific lead groups.
- **ST-Segment**: Evaluate for elevation or depression.
- **T-Waves**: Check for inversions, peaking, or flattening.

### 6. Summary & Differential
Review all your findings in one place. You can then click **"Generate Differential"** to have the AI suggest potential clinical diagnoses based on the findings and patient context.

---

## 📄 Disclaimer
*LeadCoPilot is an educational and clinical assistant tool for trained medical professionals. It is not a substitute for professional clinical judgment and should not be used as the sole basis for medical decisions.*

---
Built for clinicians, by clinicians.
