// js/ui.js

// --- Global Variables ---
let allTeacherData = [];
let allStudentData = [];
let allSchoolData = []; 
let allNewsData = [];
let allOfficialDocs = [];
let allFormDocs = [];

// --- Config ---
const ACH_ITEMS_PER_PAGE = 6;  
const NEWS_ITEMS_PER_PAGE = 5; 
const DOCS_ITEMS_PER_PAGE = 10; 

// --- State ---
let currentFolderFilter = null; 
let currentDocFolder = null;

// =============================================================================
// 1. HELPER FUNCTIONS
// =============================================================================

function getSubjectBadge(subject) {
    if (!subject) return '';
    const cleanSubject = subject.trim();
    // ใช้โค้ดสีเดิม
    return `<span class="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md border inline-flex items-center gap-1 whitespace-nowrap"><i class="fa-solid fa-tag text-[9px]"></i> ${cleanSubject}</span>`;
}

// =============================================================================
// 2. SCHOOL INFO RENDERER (✅ ปรับปรุงใหม่: ดึงข้อมูลลง Header/Title)
// =============================================================================

export function renderSchoolInfo(info) {
    if (!info) return;

    // --- 1. อัปเดต Title ของ Browser tab ---
    if (info.school_name) {
        document.title = info.school_name;
    }

    // --- 2. อัปเดต Header (ส่วนหัวเว็บ) ---
    // ชื่อโรงเรียน (ตัวใหญ่)
    if (document.getElementById('header-school-name')) {
        document.getElementById('header-school-name').innerText = info.school_name || 'กำลังโหลด...';
    }
    // สังกัด (ตัวเล็กใต้ชื่อ)
    if (document.getElementById('header-affiliation')) {
        document.getElementById('header-affiliation').innerText = info.affiliation || '-';
    }
    // โลโก้ซ้ายบน
    if (document.getElementById('header-logo') && info.logo_url) {
        const logo = document.getElementById('header-logo');
        logo.src = info.logo_url;
        logo.classList.remove('hidden'); // โชว์รูปเมื่อโหลดเสร็จ
    }

    // --- 3. ส่วนเนื้อหา (Home & Footer) ---
    if (document.getElementById('hero-motto')) document.getElementById('hero-motto').innerText = info.motto || '-';
    if (document.getElementById('footer-school-name')) document.getElementById('footer-school-name').innerText = info.school_name || '';
    
    // อายุโรงเรียน
    if (info.founding_date && document.getElementById('school-age-badge')) {
        const age = new Date().getFullYear() - new Date(info.founding_date).getFullYear();
        document.getElementById('school-age-badge').innerText = `ก่อตั้งมาแล้ว ${age} ปี`;
    }

    // --- 4. หน้าข้อมูลพื้นฐาน (Basic Info Page) ---
    const basicFields = {
        'info-name-th': info.school_name,
        'info-name-en': info.school_name_en,
        'info-school-code': info.school_code_10,
        'info-smis-code': info.smis_code_8,
        'info-obec-code': info.obec_code_6,
        'info-affiliation': info.affiliation,
        'info-address': info.address
    };

    for (const [id, value] of Object.entries(basicFields)) {
        const el = document.getElementById(id);
        if (el) el.innerText = value || '-';
    }

    // --- 5. หน้าเกี่ยวกับโรงเรียน (About Page) ---
    const aboutFields = {
        'school-history-content': info.history,
        'info-vision': info.vision,
        'school-mission-content': info.mission,
        'info-philosophy': info.philosophy,
        'info-motto': info.motto,
        'school-identity-content': info.identity
    };

    for (const [id, value] of Object.entries(aboutFields)) {
        const el = document.getElementById(id);
        if (el) el.innerText = value || '-';
    }

    // สีประจำโรงเรียน
    if (document.getElementById('school-color-box')) {
        const c1 = info.color_code_1 || '#ddd';
        const c2 = info.color_code_2 || c1 || '#ddd';
        document.getElementById('school-color-box').style.background = `linear-gradient(to right, ${c1} 50%, ${c2} 50%)`;
    }

    // รูปเครื่องแบบ
    if (document.getElementById('student-uniform-img')) {
        const img = document.getElementById('student-uniform-img');
        const placeholder = document.getElementById('uniform-placeholder');
        if (info.uniform_url) {
            img.src = info.uniform_url;
            img.classList.remove('hidden');
            if(placeholder) placeholder.classList.add('hidden');
        } else {
            img.classList.add('hidden');
            if(placeholder) placeholder.classList.remove('hidden');
        }
    }

    // --- 6. สื่อ (VTR & เพลง) ---
    if (info.song_url && document.getElementById('school-song')) {
        document.getElementById('school-song').src = info.song_url;
        document.getElementById('music-player-controls').classList.remove('hidden');
    }

    if (info.vtr_url && document.getElementById('vtr-iframe')) {
        let vid = '';
        try {
            if (info.vtr_url.includes('v=')) vid = info.vtr_url.split('v=')[1].split('&')[0];
            else if (info.vtr_url.includes('youtu.be/')) vid = info.vtr_url.split('youtu.be/')[1];
        } catch (e) {}

        if (vid) {
            document.getElementById('vtr-iframe').src = `https://www.youtube.com/embed/${vid}`;
            if(document.getElementById('vtr-placeholder')) document.getElementById('vtr-placeholder').classList.add('hidden');
        }
    }
}

// =============================================================================
// 3. ACHIEVEMENT SYSTEM
// =============================================================================

export function renderAchievementSystem(containerId, data, type) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.className = "w-full"; 
    container.innerHTML = '';

    if (!data || data.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-10 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200"><i class="fa-solid fa-folder-open text-3xl mb-2 opacity-50"></i><p>ไม่พบข้อมูล</p></div>';
        return;
    }

    if (currentFolderFilter === null) {
        renderFolders(containerId, data, type);
    } else {
        const filteredData = data.filter(item => (item.competition || 'รายการอื่นๆ') === currentFolderFilter);
        const backBtnContainer = document.createElement('div');
        backBtnContainer.className = "w-full mb-6 animate-fade-in";
        backBtnContainer.innerHTML = `
            <div class="flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <h3 class="font-bold text-gray-800 flex items-center gap-2"><i class="fa-solid fa-folder-open text-yellow-500"></i> ${currentFolderFilter}</h3>
                <button onclick="clearFolderFilter('${containerId}', '${type}')" class="text-sm text-blue-600 hover:underline font-bold flex items-center gap-1"><i class="fa-solid fa-arrow-left"></i> ย้อนกลับ</button>
            </div>`;
        container.appendChild(backBtnContainer);
        renderPagedAchievements(container, filteredData, type, 1);
    }
}

function renderFolders(containerId, data, type) {
    const container = document.getElementById(containerId);
    const groups = data.reduce((acc, item) => {
        const key = item.competition || 'รายการอื่นๆ';
        if (!acc[key]) { acc[key] = { count: 0, latestImage: item.image }; }
        acc[key].count++;
        if(!acc[key].latestImage && item.image) acc[key].latestImage = item.image;
        return acc;
    }, {});

    const gridDiv = document.createElement('div');
    gridDiv.className = "w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";

    Object.keys(groups).forEach(name => {
        const group = groups[name];
        const folderDiv = document.createElement('div');
        folderDiv.className = `bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md cursor-pointer flex items-center gap-4 transition duration-200 group`;
        folderDiv.onclick = () => selectFolder(containerId, type, name);
        folderDiv.innerHTML = `
            <div class="w-14 h-14 rounded-lg bg-blue-50 text-blue-400 flex items-center justify-center text-3xl group-hover:scale-110 transition">
                <i class="fa-solid fa-folder"></i>
            </div>
            <div>
                <h4 class="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition line-clamp-1">${name}</h4>
                <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">${group.count} รายการ</span>
            </div>
        `;
        gridDiv.appendChild(folderDiv);
    });
    container.appendChild(gridDiv);
}

function renderPagedAchievements(container, pageItemsFullList, type, page = 1) {
    let gridWrapper = container.querySelector('.achievements-grid-wrapper');
    if (!gridWrapper) {
        gridWrapper = document.createElement('div');
        gridWrapper.className = "achievements-grid-wrapper w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
        container.appendChild(gridWrapper);
    } else { gridWrapper.innerHTML = ''; }

    const startIndex = (page - 1) * ACH_ITEMS_PER_PAGE;
    const pageItems = pageItemsFullList.slice(startIndex, startIndex + ACH_ITEMS_PER_PAGE);

    pageItems.forEach(item => {
        const clickAction = item.fileUrl ? `window.open('${item.fileUrl}', '_blank')` : `window.open('${item.image || '#'}', '_blank')`;
        const div = document.createElement('div');
        div.className = `bg-white rounded-xl shadow-sm hover:shadow-lg transition border border-gray-100 overflow-hidden cursor-pointer group`;
        div.onclick = () => window.open(item.fileUrl || item.image || '#', '_blank');
        
        div.innerHTML = `
            <div class="h-48 bg-gray-100 relative overflow-hidden">
                 ${item.image ? `<img src="${item.image}" class="w-full h-full object-cover transition duration-500 group-hover:scale-105">` : `<div class="w-full h-full flex flex-col items-center justify-center text-gray-400"><i class="fa-solid fa-file-image text-4xl"></i></div>`}
            </div>
            <div class="p-4">
                <h4 class="font-bold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition">${item.title || '-'}</h4>
                <p class="text-xs text-gray-500 mt-2 flex items-center gap-1"><i class="fa-regular fa-calendar"></i> ${item.date ? new Date(item.date).toLocaleDateString('th-TH') : '-'}</p>
            </div>
        `;
        gridWrapper.appendChild(div);
    });
}

// =============================================================================
// 4. NEWS & DOCS
// =============================================================================

export function renderNews(data) {
    const container = document.getElementById('news-container');
    if (!container) return;
    container.innerHTML = '';
    
    if(!data || data.length === 0) {
        container.innerHTML = '<div class="text-center p-8 text-gray-400">ไม่พบน่าวสาร</div>';
        return;
    }

    data.slice(0, NEWS_ITEMS_PER_PAGE).forEach(news => {
        const div = document.createElement('div');
        div.className = "bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col md:flex-row gap-4 mb-4 group cursor-pointer";
        div.onclick = () => { if(news.link) window.open(news.link, '_blank'); };
        div.innerHTML = `
            <div class="w-full md:w-48 h-32 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                ${news.image ? `<img src="${news.image}" class="w-full h-full object-cover group-hover:scale-105 transition">` : ''}
            </div>
            <div class="flex-1">
                <h4 class="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition line-clamp-2">${news.title}</h4>
                <p class="text-sm text-gray-500 mt-2"><i class="fa-regular fa-clock"></i> ${new Date(news.date).toLocaleDateString('th-TH')}</p>
            </div>
        `;
        container.appendChild(div);
    });
}

export function renderDocuments(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    
    if(!data || data.length === 0) {
        container.innerHTML = '<div class="text-center p-4 text-gray-400">ไม่พบเอกสาร</div>';
        return;
    }

    data.forEach(doc => {
        const div = document.createElement('div');
        div.className = "flex justify-between items-center p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition mb-2 group";
        div.innerHTML = `
            <div class="flex items-center gap-3 overflow-hidden">
                <div class="w-10 h-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0"><i class="fa-solid fa-file-pdf text-xl"></i></div>
                <div class="truncate">
                    <h4 class="font-bold text-gray-700 text-sm truncate group-hover:text-blue-600 transition">${doc.title}</h4>
                    <span class="text-xs text-gray-400">${doc.category || 'ทั่วไป'}</span>
                </div>
            </div>
            <a href="${doc.fileUrl}" target="_blank" class="text-gray-400 hover:text-blue-600 transition px-2"><i class="fa-solid fa-download"></i></a>
        `;
        container.appendChild(div);
    });
}

// =============================================================================
// 5. EXPORTS & HELPERS
// =============================================================================

export function renderSchoolAchievements(data) { 
    if (!data) return;
    allSchoolData = [...data].sort((a, b) => b.id - a.id);
    
    const onet = allSchoolData.filter(i => i.title.includes('O-NET') || (i.competition && i.competition.includes('O-NET')));
    const nt = allSchoolData.filter(i => i.title.includes('NT') || (i.competition && i.competition.includes('NT')));
    const rt = allSchoolData.filter(i => i.title.includes('RT') || (i.competition && i.competition.includes('RT')));
    const general = allSchoolData.filter(i => !onet.includes(i) && !nt.includes(i) && !rt.includes(i));

    renderAchievementSystem('school-achievements-container', general, 'school');
    if(document.getElementById('onet-container')) renderAchievementSystem('onet-container', onet, 'school');
    if(document.getElementById('nt-container')) renderAchievementSystem('nt-container', nt, 'school');
    if(document.getElementById('rt-container')) renderAchievementSystem('rt-container', rt, 'school');
}

export function renderTeacherAchievements(data) { allTeacherData = data; renderAchievementSystem('teacher-achievements-container', data, 'teacher'); }
export function renderStudentAchievements(data) { allStudentData = data; renderAchievementSystem('student-achievements-container', data, 'student'); }

export function renderInnovations(data) { 
    const c = document.getElementById('innovations-container'); 
    if(c && data) { 
        c.innerHTML=''; 
        if(data.length === 0) c.innerHTML = '<div class="col-span-full text-center text-gray-400">ยังไม่มีนวัตกรรม</div>';
        data.forEach(i => { 
            c.innerHTML += `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition cursor-pointer" onclick="window.open('${i.fileUrl}','_blank')">
                <div class="aspect-video bg-gray-200 relative">
                    ${i.coverImageUrl ? `<img src="${i.coverImageUrl}" class="w-full h-full object-cover">` : '<div class="w-full h-full flex items-center justify-center text-gray-400"><i class="fa-solid fa-lightbulb text-4xl"></i></div>'}
                </div>
                <div class="p-4">
                    <h4 class="font-bold text-gray-800 line-clamp-1">${i.title}</h4>
                    <p class="text-xs text-gray-500 mt-1">โดย ${i.creator}</p>
                </div>
            </div>`; 
        }); 
    } 
}

export function renderPersonGrid(data, containerId) { 
    const container = document.getElementById(containerId); 
    if(!container) return; 
    container.innerHTML = ''; 
    
    if(!data || data.length === 0) { 
        container.innerHTML='<p class="text-center text-gray-500 col-span-full py-10">กำลังปรับปรุงข้อมูล</p>'; 
        return; 
    } 
    
    const sorted=[...data].sort((a,b)=>a.id-b.id); 
    const leader=sorted[0]; 
    const others=sorted.slice(1); 
    
    const createCard = (p) => `
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-lg transition transform hover:-translate-y-1 h-full">
            <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 bg-gray-100">
                ${p.image ? `<img src="${p.image}" class="w-full h-full object-cover">` : '<div class="w-full h-full flex items-center justify-center text-gray-300"><i class="fa-solid fa-user text-4xl"></i></div>'}
            </div>
            <h3 class="text-lg font-bold text-gray-800 mb-1 line-clamp-1">${p.name}</h3>
            <p class="text-blue-600 font-medium text-sm">${p.role}</p>
        </div>`; 
        
    let html=''; 
    if(leader) html+=`<div class="flex justify-center mb-10"><div class="w-full max-w-xs transform scale-110">${createCard(leader)}</div></div>`; 
    if(others.length>0){ html+='<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">'; others.forEach(p=>html+=createCard(p)); html+='</div>'; } 
    container.innerHTML=html; 
}

export function renderHistoryTable(tbodyId, data) { 
    const tbody = document.getElementById(tbodyId); 
    if (!tbody) return; 
    tbody.innerHTML = ''; 
    
    if (!data || data.length === 0) { 
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-6 text-gray-400">ไม่มีข้อมูล</td></tr>'; 
        return; 
    } 
    
    [...data].sort((a,b)=>b.id-a.id).forEach((item,index)=>{ 
        const tr=document.createElement('tr'); 
        tr.className='hover:bg-gray-50 transition border-b border-gray-100'; 
        tr.innerHTML=`
            <td class="px-6 py-4 text-sm text-gray-500">${index+1}</td>
            <td class="px-6 py-4">
                <div class="flex items-center">
                    <div class="h-10 w-10 mr-4 bg-gray-200 rounded-full overflow-hidden shrink-0 border border-gray-200">
                        ${item.image?`<img class="h-10 w-10 object-cover" src="${item.image}">`:'<div class="h-full w-full flex items-center justify-center text-gray-400"><i class="fa-solid fa-user"></i></div>'}
                    </div>
                    <div class="font-bold text-gray-800">${item.name}</div>
                </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">${item.role||'-'}</td>
            <td class="px-6 py-4 text-sm text-blue-600 font-medium">${item.year||'-'}</td>
        `; 
        tbody.appendChild(tr); 
    }); 
}

export function renderStudentChart(data) { 
    const container = document.getElementById('student-summary-container'); 
    const chartCanvas = document.getElementById('studentChart'); 
    if (!data || data.length === 0) { 
        if(container) container.innerHTML = '<p class="text-center text-gray-400 col-span-3 py-10">ยังไม่มีข้อมูลนักเรียน</p>'; 
        return; 
    } 
    
    data.sort((a, b) => a.id - b.id); 
    let totalMale = 0, totalFemale = 0; 
    data.forEach(d => { totalMale += parseInt(d.male || 0); totalFemale += parseInt(d.female || 0); }); 
    
    if (container) { 
        container.innerHTML = `
            <div class="bg-blue-50 p-4 rounded-xl text-center border border-blue-100"><h3 class="text-blue-800 font-bold text-lg">ทั้งหมด</h3><p class="text-3xl font-bold text-blue-600">${totalMale + totalFemale} <span class="text-sm">คน</span></p></div>
            <div class="bg-green-50 p-4 rounded-xl text-center border border-green-100"><h3 class="text-green-800 font-bold text-lg">ชาย</h3><p class="text-3xl font-bold text-green-600">${totalMale} <span class="text-sm">คน</span></p></div>
            <div class="bg-pink-50 p-4 rounded-xl text-center border border-pink-100"><h3 class="text-pink-800 font-bold text-lg">หญิง</h3><p class="text-3xl font-bold text-pink-600">${totalFemale} <span class="text-sm">คน</span></p></div>
        `; 
    } 
    
    if (chartCanvas && window.Chart) { 
        if (window.myStudentChart) window.myStudentChart.destroy(); 
        window.myStudentChart = new Chart(chartCanvas, { 
            type: 'bar', 
            data: { 
                labels: data.map(d => d.grade), 
                datasets: [ 
                    { label: 'ชาย', data: data.map(d => d.male), backgroundColor: '#3b82f6', borderRadius: 4 }, 
                    { label: 'หญิง', data: data.map(d => d.female), backgroundColor: '#ec4899', borderRadius: 4 } 
                ] 
            }, 
            options: { 
                responsive: true, maintainAspectRatio: false, 
                scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }, 
                plugins: { legend: { position: 'bottom' }, title: { display: false } } 
            } 
        }); 
    } 
}

export function renderHomeNews(newsList) { 
    const c = document.getElementById('home-news-container'); 
    if(c) { 
        c.innerHTML = ''; 
        if(!newsList || newsList.length === 0) { c.innerHTML = '<div class="text-center py-10 text-gray-300 text-sm">ยังไม่มีข่าว</div>'; return; }
        [...newsList].sort((a, b) => b.id - a.id).slice(0,4).forEach(n => {
            c.innerHTML += `
            <div class="p-3 border-b border-gray-50 flex gap-3 hover:bg-gray-50 cursor-pointer transition rounded-lg group" onclick="window.open('${n.link || '#'}', '_blank')">
                <div class="w-16 h-12 bg-gray-200 rounded-md overflow-hidden shrink-0">
                    ${n.image ? `<img src="${n.image}" class="w-full h-full object-cover group-hover:scale-110 transition">` : ''}
                </div>
                <div>
                    <h4 class="text-sm font-bold text-gray-700 line-clamp-1 group-hover:text-blue-600">${n.title}</h4>
                    <p class="text-xs text-gray-400 mt-1">${new Date(n.date).toLocaleDateString('th-TH')}</p>
                </div>
            </div>`; 
        }); 
    } 
}

// Window Global Functions
window.selectFolder = (cid, type, name) => {
    currentFolderFilter = name;
    let data = type==='teacher'?allTeacherData : (type==='student'?allStudentData : allSchoolData);
    if(cid.includes('onet')) data = data.filter(d => d.title.includes('O-NET') || d.competition.includes('O-NET'));
    else if(cid.includes('nt')) data = data.filter(d => d.title.includes('NT') || d.competition.includes('NT'));
    else if(cid.includes('rt')) data = data.filter(d => d.title.includes('RT') || d.competition.includes('RT'));
    renderAchievementSystem(cid, data, type);
};

window.clearFolderFilter = (cid, type) => {
    currentFolderFilter = null;
    let data = type==='teacher'?allTeacherData : (type==='student'?allStudentData : allSchoolData);
    if(cid.includes('onet')) data = data.filter(d => d.title.includes('O-NET') || d.competition.includes('O-NET'));
    else if(cid.includes('nt')) data = data.filter(d => d.title.includes('NT') || d.competition.includes('NT'));
    else if(cid.includes('rt')) data = data.filter(d => d.title.includes('RT') || d.competition.includes('RT'));
    renderAchievementSystem(cid, data, type);
};

window.filterNews = (id, cid) => { 
    const input = document.getElementById(id);
    const searchText = input.value.toLowerCase().trim();
    const filtered = allNewsData.filter(item => !searchText || item.title.toLowerCase().includes(searchText));
    renderPagedNews(cid, filtered, 1);
};

window.filterDocuments = (id, cid) => {
    const input = document.getElementById(id);
    const searchText = input.value.toLowerCase().trim();
    const isOfficial = cid.includes('official');
    const sourceData = isOfficial ? allOfficialDocs : allFormDocs;
    if (searchText) {
        currentDocFolder = 'ผลการค้นหา';
        const filtered = sourceData.filter(item => item.title.toLowerCase().includes(searchText));
        const container = document.getElementById(cid);
        container.innerHTML = '';
        renderPagedDocs(container, filtered, isOfficial?'official':'form', 1);
    } else {
        window.clearDocFolder(cid, isOfficial?'official':'form');
    }
};

window.filterAchievements = (id, selId, cid) => { /* Reuse logic if needed, or implement specific one */ };
