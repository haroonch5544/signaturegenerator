// Canvas and DOM elements
const canvas = document.getElementById('signatureCanvas');
const ctx = canvas.getContext('2d');
const nameInput = document.getElementById('nameInput');
const generateBtn = document.getElementById('generateBtn');
const signaturePlaceholder = document.getElementById('signaturePlaceholder');

// Signature fonts array (10 Google Fonts)
const signatureFonts = [
    'Pacifico',
    'Dancing Script',
    'Great Vibes',
    'Allura',
    'Satisfy',
    'Sacramento',
    'Alex Brush',
    'Yellowtail',
    'Marck Script',
    'Kaushan Script'
];

// Ink colors (locked palette)
const inkColors = [
    '#111827', // black
    '#1E3A8A', // dark blue
    '#374151', // charcoal
    '#065F46'  // deep green
];

// Canvas setup
function setupCanvas() {
    canvas.width = 800;
    canvas.height = 300;
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Smooth scroll to generator section
function scrollToGenerator() {
    document.getElementById('generator').scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

// Get random signature style with variations
function getSignatureStyle(name) {
    // Randomly select one font
    const selectedFont = signatureFonts[Math.floor(Math.random() * signatureFonts.length)];
    
    // Base font size
    const baseSize = 70;
    
    // Apply subtle variations (±5%)
    const sizeVariation = (Math.random() - 0.5) * 0.1; // -5% to +5%
    const fontSize = Math.round(baseSize * (1 + sizeVariation));
    
    // Letter spacing variation (±0.5px)
    const spacingVariation = (Math.random() - 0.5) * 1; // -0.5px to +0.5px
    const letterSpacing = 1 + spacingVariation;
    
    // Rotation variation (±1 degree)
    const rotationVariation = (Math.random() - 0.5) * 2; // -1° to +1°
    
    // Randomly select one ink color
    const inkColor = inkColors[Math.floor(Math.random() * inkColors.length)];
    
    return {
        fontFamily: selectedFont,
        fontSize: fontSize,
        letterSpacing: letterSpacing,
        rotation: rotationVariation,
        inkColor: inkColor
    };
}

// Calculate text width with font and letter spacing
function getTextWidth(text, font, letterSpacing) {
    ctx.font = font;
    // Measure each character separately to account for letter spacing
    let totalWidth = 0;
    for (let i = 0; i < text.length; i++) {
        totalWidth += ctx.measureText(text[i]).width;
        if (i < text.length - 1) {
            // Add letter spacing (approximate, since canvas doesn't support letter-spacing directly)
            totalWidth += (letterSpacing - 1) * 2;
        }
    }
    return totalWidth;
}

// Draw signature with elegant animation
async function drawSignatureAnimated(name) {
    if (!name || name.trim() === '') {
        return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const style = getSignatureStyle(name);
    
    // Build font string
    const fontString = `italic bold ${style.fontSize}px "${style.fontFamily}", cursive`;
    ctx.font = fontString;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Center position
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    
    // Hide placeholder, show canvas
    signaturePlaceholder.style.display = 'none';
    canvas.classList.add('show');
    
    // Set ink color
    ctx.fillStyle = style.inkColor;
    ctx.strokeStyle = style.inkColor;
    
    // Draw signature with smooth animation
    const text = name.trim();
    const charDelay = 80; // milliseconds between each character
    
    // Save context for rotation
    ctx.save();
    
    // Apply subtle rotation to entire signature
    if (style.rotation !== 0) {
        ctx.translate(x, y);
        ctx.rotate((style.rotation * Math.PI) / 180);
        ctx.translate(-x, -y);
    }
    
    // Draw each character with animation
    let currentX = x - (getTextWidth(text, fontString, style.letterSpacing) / 2);
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charWidth = ctx.measureText(char).width;
        const charX = currentX;
        
        // Smooth character appearance
        await new Promise(resolve => setTimeout(resolve, charDelay));
        
        // Draw with fade-in effect
        ctx.globalAlpha = 0;
        const opacitySteps = 8;
        
        for (let step = 0; step < opacitySteps; step++) {
            ctx.globalAlpha = step / opacitySteps;
            ctx.fillText(char, charX, y);
            await new Promise(resolve => setTimeout(resolve, 8));
        }
        ctx.globalAlpha = 1;
        
        // Move to next character position with letter spacing
        currentX += charWidth + (style.letterSpacing - 1) * 4;
    }
    
    // Reset alpha
    ctx.globalAlpha = 1;
    ctx.restore();
    
    // Add subtle underline flourish
    await new Promise(resolve => setTimeout(resolve, 200));
    await addFlourish(ctx, x, y, text, style);
}

// Add elegant flourish to signature
async function addFlourish(context, x, y, text, style) {
    context.save();
    context.strokeStyle = style.inkColor;
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.globalAlpha = 0.6;
    
    const textWidth = getTextWidth(text, context.font, style.letterSpacing);
    
    // Simple underline
    const startX = x - textWidth / 2 - 10;
    const endX = x + textWidth / 2 + 10;
    const flourishY = y + 40;
    const steps = 20;
    
    // Draw underline with smooth animation
    for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        const currentX = startX + (endX - startX) * progress;
        
        context.beginPath();
        context.moveTo(startX, flourishY);
        context.lineTo(currentX, flourishY);
        context.stroke();
        
        await new Promise(resolve => setTimeout(resolve, 8));
    }
    
    context.globalAlpha = 1;
    context.restore();
}

// Generate signature
function generateSignature() {
    const name = nameInput.value.trim();
    
    if (!name) {
        // Add shake animation to input
        nameInput.style.animation = 'shake 0.5s';
        setTimeout(() => {
            nameInput.style.animation = '';
            nameInput.focus();
        }, 500);
        return;
    }
    
    // Button loading state
    generateBtn.disabled = true;
    generateBtn.querySelector('span').textContent = 'Generating...';
    
    // Reset canvas
    setupCanvas();
    
    // Draw signature with animation
    drawSignatureAnimated(name).then(() => {
        // Reset button
        generateBtn.disabled = false;
        generateBtn.querySelector('span').textContent = 'Generate Signature';
        
        // Add download button
        addDownloadButton();
    });
}

// Add download button after signature is generated
function addDownloadButton() {
    // Remove existing download button if any
    const existingBtn = document.querySelector('.download-btn');
    if (existingBtn) {
        existingBtn.remove();
    }
    
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'download-btn generate-btn';
    downloadBtn.innerHTML = `
        <span>Download Signature</span>
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
    `;
    downloadBtn.style.marginTop = '20px';
    downloadBtn.style.width = '100%';
    
    downloadBtn.addEventListener('click', downloadSignature);
    
    const inputGroup = document.querySelector('.input-group');
    inputGroup.after(downloadBtn);
}

// Download signature as image
function downloadSignature() {
    const link = document.createElement('a');
    link.download = `signature-${nameInput.value.trim().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Scroll fade-in observer
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-section').forEach(section => {
        observer.observe(section);
    });
}

// Add shake animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
`;
document.head.appendChild(style);

// Event listeners
generateBtn.addEventListener('click', generateSignature);

nameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generateSignature();
    }
});

// Initialize on load
window.addEventListener('load', () => {
    setupCanvas();
    setupScrollAnimations();
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});