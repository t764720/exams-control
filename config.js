//  الإعدادات الافتراضية للاختبار
const DEFAULT_CONFIG = {
  gradeBadge: "ثاني متوسط - مادة المهارات الرقمية",
  quizTitle: "اختبار عملي: حلقات التكرار (Loops)",
  quizDesc: "أجب عن الأسئلة التالية واضغط على \"اختبار الحل\" للتحقق قبل الإرسال النهائي.",
  scriptUrl: "https://script.google.com/macros/s/AKfycbyFDkm7oNZjv0sEU6-TsYm28nPF-UHaaokoOYhZv1RaEuNmMwMmctSk0meAgAfOchFg/exec",
  questions: [
    {
      id: "q1",
      type: "code",
      title: "السؤال الأول: حلقة for",
      score: 1,
      description: "اكتب مقطعاً برمجياً بلغة بايثون يقوم بطباعة الأعداد من <strong>5</strong> إلى <strong>15</strong> (متضمنة الرقمين) باستخدام حلقة <code>for</code>.",
      placeholder: "# اكتب الكود هنا",
      requiredKeyword: "for",
      expectedOutput: "5\n6\n7\n8\n9\n10\n11\n12\n13\n14\n15"
    },
    {
      id: "q2",
      type: "mcq",
      title: "السؤال الثاني: اختيار من متعدد",
      score: 1,
      description: "أي من الدوال التالية تُستخدم في بايثون لتوليد تسلسل من الأرقام في حلقات التكرار؟",
      options: [
        "range()",
        "loop()",
        "sequence()",
        "count()"
      ],
      correctAnswer: 0
    },
    {
      id: "q3",
      type: "reorder",
      title: "السؤال الثالث: ترتيب خطوات",
      score: 1,
      description: "قم بترتيب مراحل كتابة البرنامج الآتية بالتسلسل الصحيح من البداية إلى النهاية:",
      items: [
        "فهم المشكلة وتحليلها",
        "كتابة الخوارزمية ورسم مخطط الانسياب",
        "كتابة البرنامج بإحدى لغات البرمجة",
        "اختبار البرنامج وتصحيح الأخطاء"
      ]
    }
  ]
};

function getQuizConfig() {
  try {
    const saved = localStorage.getItem("quiz_custom_config");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error reading config:", e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}

function saveQuizConfig(cfg) {
  localStorage.setItem("quiz_custom_config", JSON.stringify(cfg));
}

function resetQuizConfig() {
  localStorage.removeItem("quiz_custom_config");
  return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
}
