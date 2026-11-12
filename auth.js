// auth.js - نظام الحماية وقفل الدخول للمعلم
// يستخدم خوارزمية SHA-256 لتشفير وفحص كلمة المرور

const TeacherAuth = {
  // الـ Hash الافتراضي لكلمة المرور (القيمة الافتراضية الأولية: admin123)
  DEFAULT_HASH: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",

  // توليد SHA-256 hash من النص باستخدام Web Crypto API المدمج في المتصفح
  async sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // جلب الهاش المعتمد (من التخزين المحلي إذا قام المعلم بتغييره، أو الافتراضي)
  getTargetHash() {
    return localStorage.getItem('teacher_auth_hash') || this.DEFAULT_HASH;
  },

  // التحقق من صحة جلسة المعلم الحالية
  isAuthenticated() {
    return sessionStorage.getItem('teacher_authenticated') === 'true';
  },

  // تسجيل الخروج
  logout() {
    sessionStorage.removeItem('teacher_authenticated');
    window.location.reload();
  },

  // تغيير كلمة المرور
  async changePassword(oldPass, newPass) {
    const oldHash = await this.sha256(oldPass);
    if (oldHash !== this.getTargetHash()) {
      return { success: false, message: 'كلمة المرور الحالية غير صحيحة!' };
    }
    if (!newPass || newPass.trim().length < 4) {
      return { success: false, message: 'كلمة المرور الجديدة يجب أن تكون 4 خانات على الأقل!' };
    }
    const newHash = await this.sha256(newPass.trim());
    localStorage.setItem('teacher_auth_hash', newHash);
    return { success: true, message: 'تم تغيير كلمة المرور بنجاح!' };
  },

  // فحص كلمة المرور المدخلة
  async verifyPassword(pass) {
    const hash = await this.sha256(pass.trim());
    if (hash === this.getTargetHash()) {
      sessionStorage.setItem('teacher_authenticated', 'true');
      return true;
    }
    return false;
  },

  // فرض الحماية على الصفحة الحالية
  protectPage(pageTitle = "لوحة التحكم") {
    // إذا كان مسجلاً للدخول بالفعل، نعرض الصفحة
    if (this.isAuthenticated()) {
      document.documentElement.style.visibility = 'visible';
      this.attachLogoutButton();
      return;
    }

    // إخفاء الصفحة فوراً لمنع التلصص قبل التحقق
    document.documentElement.style.visibility = 'hidden';

    window.addEventListener('DOMContentLoaded', () => {
      this.showLockModal(pageTitle);
    });
  },

  // عرض نافذة تسجيل الدخول المقفلة
  showLockModal(pageTitle) {
    // إزالة أي شاشة سابقة
    const oldModal = document.getElementById('authLockModal');
    if (oldModal) oldModal.remove();

    const modal = document.createElement('div');
    modal.id = 'authLockModal';
    modal.className = 'fixed inset-0 z-[999999] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 font-["Cairo"]';
    modal.setAttribute('dir', 'rtl');

    modal.innerHTML = `
      <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 text-center animate-fade-in relative overflow-hidden">
        <div class="w-16 h-16 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
          🔒
        </div>
        
        <h2 class="text-xl font-extrabold text-slate-800 mb-1">منطقة محمية للمعلم</h2>
        <p class="text-xs text-slate-500 mb-5 leading-relaxed">
          يتطلب الدخول إلى <span class="font-bold text-slate-700">${pageTitle}</span> إدخال كلمة المرور السرية.
        </p>

        <form id="authLoginForm" onsubmit="TeacherAuth.handleLogin(event)" class="space-y-4">
          <div class="relative">
            <input type="password" id="authPasswordInput" autofocus placeholder="أدخل كلمة المرور..." 
              class="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-center text-slate-800 font-bold tracking-widest focus:ring-2 focus:ring-indigo-500 focus:outline-none transition">
          </div>

          <div id="authErrorMsg" class="hidden text-xs text-rose-600 font-bold bg-rose-50 border border-rose-200 py-2 px-3 rounded-lg">
            كلمة المرور غير صحيحة، حاول مجدداً!
          </div>

          <button type="submit" id="authSubmitBtn" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2">
            <span>تسجيل الدخول</span>
            <span>🔑</span>
          </button>
        </form>

        <div class="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <a href="portal.html" class="hover:text-slate-600 transition">← عودة لبوابة الاختبارات</a>
          <span class="text-[10px] text-slate-300">نظام حماية المعلم</span>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.documentElement.style.visibility = 'visible';

    setTimeout(() => {
      document.getElementById('authPasswordInput')?.focus();
    }, 150);
  },

  async handleLogin(e) {
    e.preventDefault();
    const input = document.getElementById('authPasswordInput');
    const errBox = document.getElementById('authErrorMsg');
    const btn = document.getElementById('authSubmitBtn');
    
    const pass = input.value;
    if (!pass) return;

    btn.disabled = true;
    btn.innerHTML = `<span>جاري التحقق...</span>`;

    const isValid = await this.verifyPassword(pass);
    if (isValid) {
      const modal = document.getElementById('authLockModal');
      if (modal) modal.remove();
      this.attachLogoutButton();
    } else {
      errBox.classList.remove('hidden');
      input.value = '';
      input.classList.add('border-rose-400', 'bg-rose-50');
      btn.disabled = false;
      btn.innerHTML = `<span>تسجيل الدخول</span><span>🔑</span>`;
      input.focus();
    }
  },

  // إضافة زر تسجيل خروج وزر تغيير كلمة المرور تلقائياً في شريط العنوان
  attachLogoutButton() {
    const navContainers = document.querySelectorAll('header, .max-w-4xl > div:first-child, .max-w-5xl > div:first-child');
    if (navContainers.length > 0 && !document.getElementById('authNavControls')) {
      const target = navContainers[0].querySelector('.flex.items-center.gap-2, .flex.items-center.gap-3');
      if (target) {
        const span = document.createElement('span');
        span.id = 'authNavControls';
        span.className = 'inline-flex items-center gap-1.5';
        span.innerHTML = `
          <button onclick="TeacherAuth.promptChangePassword()" title="تغيير كلمة المرور" class="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition flex items-center gap-1">
            <span>🔑</span>
          </button>
          <button onclick="TeacherAuth.logout()" title="قفل الخروج" class="px-2.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition flex items-center gap-1">
            <span>🚪 خروج</span>
          </button>
        `;
        target.appendChild(span);
      }
    }
  },

  async promptChangePassword() {
    const oldP = prompt("أدخل كلمة المرور الحالية:");
    if (!oldP) return;
    const newP = prompt("أدخل كلمة المرور الجديدة (4 خانات على الأقل):");
    if (!newP) return;
    const confirmP = prompt("تأكيد كلمة المرور الجديدة:");
    if (newP !== confirmP) {
      alert("كلمتا المرور غير متطابقتين!");
      return;
    }

    const res = await this.changePassword(oldP, newP);
    alert(res.message);
  }
};

