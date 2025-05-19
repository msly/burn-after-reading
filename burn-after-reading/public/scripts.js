/**
 * 阅后即焚 - 前端交互脚本
 */

// 应用状态
const state = {
    currentId: null,
    currentView: null,
    content: null
};

// DOM 元素
const pageContainer = document.getElementById('page-container');

// 页面模板
const templates = {
    home: document.getElementById('home-template'),
    create: document.getElementById('create-template'),
    success: document.getElementById('success-template'),
    password: document.getElementById('password-template'),
    content: document.getElementById('content-template'),
    expired: document.getElementById('expired-template'),
    destroyed: document.getElementById('destroyed-template')
};

// 路由处理
function handleRoute() {
    const hash = window.location.hash || '#';
    
    // 清空容器
    pageContainer.innerHTML = '';
    state.currentView = null;
    
    if (hash === '#' || hash === '#home') {
        // 首页
        renderHomePage();
    } else if (hash === '#create') {
        // 创建页面
        renderCreatePage();
    } else if (hash.startsWith('#view/')) {
        // 查看内容页面
        const id = hash.replace('#view/', '');
        state.currentId = id;
        fetchContentInfo(id);
    } else {
        // 默认返回首页
        renderHomePage();
    }
}

// 渲染首页
function renderHomePage() {
    state.currentView = 'home';
    const clone = templates.home.content.cloneNode(true);
    pageContainer.appendChild(clone);
}

// 渲染创建页面
function renderCreatePage() {
    state.currentView = 'create';
    const clone = templates.create.content.cloneNode(true);
    pageContainer.appendChild(clone);
    
    // 绑定提交事件
    const generateBtn = document.getElementById('generate-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', handleCreateContent);
    }
}

// 渲染成功页面
function renderSuccessPage(data) {
    state.currentView = 'success';
    const clone = templates.success.content.cloneNode(true);
    pageContainer.appendChild(clone);
    
    // 填充数据
    const linkText = document.getElementById('link-text');
    const expiryInfo = document.getElementById('expiry-info');
    const viewsCount = data.maxViews > 1 ? `${data.maxViews} 次` : '1 次';
    const expiryHours = data.expiryHours;
    let expiryText = '';
    
    if (expiryHours === 1) {
        expiryText = '1小时';
    } else if (expiryHours === 24) {
        expiryText = '1天';
    } else if (expiryHours === 168) {
        expiryText = '7天';
    } else if (expiryHours === 720) {
        expiryText = '30天';
    } else {
        expiryText = `${expiryHours}小时`;
    }
    
    const shareUrl = `${window.location.origin}/#view/${data.id}`;
    
    if (linkText) {
        linkText.textContent = shareUrl;
    }
    
    if (expiryInfo) {
        expiryInfo.textContent = `此链接将在内容被查看 ${viewsCount} 后或 ${expiryText} 后过期。`;
    }
    
    // 生成二维码
    generateQRCode(shareUrl);
    
    // 绑定复制事件
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(shareUrl).then(() => {
                alert('链接已复制到剪贴板！');
            });
        });
    }
}

// 渲染密码验证页面
function renderPasswordPage(contentInfo) {
    state.currentView = 'password';
    const clone = templates.password.content.cloneNode(true);
    pageContainer.appendChild(clone);
    
    // 填充数据
    const securityNotice = document.getElementById('security-notice');
    if (securityNotice) {
        securityNotice.textContent = `该内容在查看后可能会被销毁，剩余查看次数：${contentInfo.remainingViews}次`;
    }
    
    // 绑定验证事件
    const verifyBtn = document.getElementById('verify-btn');
    if (verifyBtn) {
        verifyBtn.addEventListener('click', () => {
            const password = document.getElementById('access-password').value;
            verifyPassword(state.currentId, password);
        });
    }
}

// 渲染内容展示页面
function renderContentPage(content) {
    state.currentView = 'content';
    state.content = content;
    
    const clone = templates.content.content.cloneNode(true);
    pageContainer.appendChild(clone);
    
    // 填充内容
    const contentDisplay = document.getElementById('content-display');
    if (contentDisplay) {
        contentDisplay.textContent = content;
    }
    
    // 绑定销毁事件
    const destroyBtn = document.getElementById('destroy-btn');
    if (destroyBtn) {
        destroyBtn.addEventListener('click', () => {
            destroyContent(state.currentId);
        });
    }
}

// 渲染过期页面
function renderExpiredPage() {
    state.currentView = 'expired';
    const clone = templates.expired.content.cloneNode(true);
    pageContainer.appendChild(clone);
}

// 渲染已销毁页面
function renderDestroyedPage() {
    state.currentView = 'destroyed';
    const clone = templates.destroyed.content.cloneNode(true);
    pageContainer.appendChild(clone);
}

// 生成二维码
function generateQRCode(url) {
    const container = document.getElementById('qrcode-container');
    if (container) {
        container.innerHTML = '';
        QRCode.toCanvas(container, url, { width: 200 }, function (error) {
            if (error) console.error('QR Code 生成失败:', error);
        });
    }
}

// API 调用 - 创建加密内容
async function handleCreateContent() {
    try {
        const contentInput = document.getElementById('content-input');
        const passwordInput = document.getElementById('password-input');
        const expirySelect = document.getElementById('expiry-select');
        const viewsSelect = document.getElementById('views-select');
        
        if (!contentInput || !contentInput.value.trim()) {
            alert('请输入要加密的内容！');
            return;
        }
        
        const content = contentInput.value.trim();
        const password = passwordInput ? passwordInput.value : '';
        const expiryHours = expirySelect ? parseInt(expirySelect.value) : 24;
        const maxViews = viewsSelect ? parseInt(viewsSelect.value) : 1;
        
        // 禁用按钮并显示加载状态
        const generateBtn = document.getElementById('generate-btn');
        if (generateBtn) {
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<span class="loader"></span> 处理中...';
        }
        
        // 调用 API
        const response = await fetch('/api/content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content,
                password,
                expiryHours,
                maxViews
            })
        });
        
        if (!response.ok) {
            throw new Error('创建失败');
        }
        
        const data = await response.json();
        
        // 清空页面容器，确保只显示一个页面
        pageContainer.innerHTML = '';
        renderSuccessPage(data);
        
    } catch (error) {
        console.error('创建内容失败:', error);
        alert('创建内容失败，请重试！');
        
        // 恢复按钮状态
        const generateBtn = document.getElementById('generate-btn');
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 生成加密链接';
        }
    }
}

// API 调用 - 获取内容信息
async function fetchContentInfo(id) {
    try {
        const response = await fetch(`/api/content/${id}/info`);
        
        if (!response.ok) {
            if (response.status === 404) {
                renderExpiredPage();
                return;
            }
            throw new Error('获取内容信息失败');
        }
        
        const data = await response.json();
        
        // 确保在渲染新页面前清空容器
        pageContainer.innerHTML = '';
        
        if (data.isExpired) {
            renderExpiredPage();
        } else if (data.isDestroyed) {
            renderDestroyedPage();
        } else if (data.isPasswordProtected) {
            renderPasswordPage(data);
        } else {
            // 无密码，直接获取内容
            fetchContent(id, '');
        }
        
    } catch (error) {
        console.error('获取内容信息失败:', error);
        renderExpiredPage();
    }
}

// API 调用 - 验证密码
async function verifyPassword(id, password) {
    try {
        // 禁用按钮并显示加载状态
        const verifyBtn = document.getElementById('verify-btn');
        if (verifyBtn) {
            verifyBtn.disabled = true;
            verifyBtn.innerHTML = '<span class="loader"></span> 验证中...';
        }
        
        await fetchContent(id, password);
        
    } catch (error) {
        console.error('验证密码失败:', error);
        alert('密码验证失败，请重试！');
        
        // 恢复按钮状态
        const verifyBtn = document.getElementById('verify-btn');
        if (verifyBtn) {
            verifyBtn.disabled = false;
            verifyBtn.innerHTML = '<i class="fas fa-unlock"></i> 验证并查看';
        }
    }
}

// API 调用 - 获取内容
async function fetchContent(id, password) {
    try {
        const response = await fetch(`/api/content/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                alert('密码错误，请重试！');
                
                // 恢复按钮状态
                const verifyBtn = document.getElementById('verify-btn');
                if (verifyBtn) {
                    verifyBtn.disabled = false;
                    verifyBtn.innerHTML = '<i class="fas fa-unlock"></i> 验证并查看';
                }
                return;
            } else if (response.status === 404) {
                renderExpiredPage();
                return;
            } else if (response.status === 410) {
                renderDestroyedPage();
                return;
            }
            throw new Error('获取内容失败');
        }
        
        const data = await response.json();
        
        // 清空页面容器，确保只显示一个页面
        pageContainer.innerHTML = '';
        renderContentPage(data.content);
        
    } catch (error) {
        console.error('获取内容失败:', error);
        alert('获取内容失败，请重试！');
    }
}

// API 调用 - 手动销毁内容
async function destroyContent(id) {
    try {
        if (!confirm('确认要立即销毁此内容吗？此操作不可撤销！')) {
            return;
        }
        
        const response = await fetch(`/api/content/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('销毁内容失败');
        }
        
        renderDestroyedPage();
        
    } catch (error) {
        console.error('销毁内容失败:', error);
        alert('销毁内容失败，请重试！');
    }
}

// 初始化
window.addEventListener('DOMContentLoaded', () => {
    handleRoute();
    window.addEventListener('hashchange', handleRoute);
}); 