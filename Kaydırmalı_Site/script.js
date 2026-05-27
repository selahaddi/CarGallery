const canvas = document.getElementById('video-canvas');
const context = canvas.getContext('2d');
const profileImg = document.getElementById('profile-img');

// Resim yollarını dinamik olarak oluşturuyoruz
// Elimizdeki klasördeki numaralara göre: 1-147 ve 171-300 arası
const imagePaths = [];
for (let i = 1; i <= 147; i++) {
    imagePaths.push(`Kareler/ezgif-frame-${i.toString().padStart(3, '0')}.jpg`);
}
for (let i = 171; i <= 300; i++) {
    imagePaths.push(`Kareler/ezgif-frame-${i.toString().padStart(3, '0')}.jpg`);
}

const frameCount = imagePaths.length;
const images = [];
let imagesLoaded = 0;
let currentFrameIndex = 0;

// Ekran boyutlarına göre Canvas'ı ayarla ve ilk kareyi çiz
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    renderFrame(currentFrameIndex);
}

window.addEventListener('resize', resizeCanvas);

// Kareleri tarayıcı belleğine yükle (Preload)
// Bu işlem, animasyonun takılmadan çalışması için çok önemlidir
for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = imagePaths[i];
    img.onload = () => {
        imagesLoaded++;
        // Sadece ilk resim yüklendiğinde ekrana bas ki kullanıcı boş ekran görmesin
        if (i === 0) {
            resizeCanvas(); 
        }
    };
    images.push(img);
}

// Belirtilen indeksteki resmi Canvas üzerine 'object-fit: cover' mantığıyla çizer
function renderFrame(index) {
    if (!images[index] || !images[index].complete) return;
    
    const img = images[index];
    
    // Canvas'ı temizle
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Resmi ekrana tam sığdırmak için (aspect ratio koruyarak) oranları hesapla
    const canvasRatio = canvas.width / canvas.height;
    const imgRatio = img.width / img.height;
    
    let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
    
    if (canvasRatio > imgRatio) {
        // Ekran daha geniş, resmi genişliğe uydurup yüksekliği kırpıyoruz
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        offsetY = (canvas.height - drawHeight) / 2;
    } else {
        // Ekran daha uzun (örn. mobil), resmi yüksekliğe uydurup genişliği kırpıyoruz
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgRatio;
        offsetX = (canvas.width - drawWidth) / 2;
    }
    
    context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

// Scroll dinleyicisi
window.addEventListener('scroll', () => {
    // scroll-container elemanının üst kısmının sayfa başından ne kadar uzakta olduğu (burada en başta olduğu için 0)
    // Kaydırılabilir toplam alan = Container yüksekliği - Ekran yüksekliği
    const scrollContainer = document.querySelector('.scroll-container');
    
    // getBoundingClientRect().top, elemanın ekrandaki mevcut konumunu verir
    const rect = scrollContainer.getBoundingClientRect();
    
    // Scroll miktarını hesapla: (Maksimum kaydırma = Alan yüksekliği - viewport yüksekliği)
    const maxScroll = rect.height - window.innerHeight;
    
    // Sayfanın ne kadar kaydırıldığı (-rect.top bize elemanın içindeki kaydırma miktarını verir)
    // Eğer container sayfanın en başındaysa, -rect.top === window.scrollY olacaktır
    let scrolled = -rect.top;
    
    // Yüzdelik dilimi bul
    let scrollFraction = scrolled / maxScroll;
    
    // Sınırların dışına çıkmayı engelle
    if (scrollFraction < 0) scrollFraction = 0;
    if (scrollFraction > 1) scrollFraction = 1;
    
    // Yüzdeye denk gelen kare indeksini bul
    const frameIndex = Math.min(
        frameCount - 1,
        Math.floor(scrollFraction * frameCount)
    );
    
    // Sadece farklı bir kareye geçtiğimizde tekrar çiz
    if (frameIndex !== currentFrameIndex) {
        currentFrameIndex = frameIndex;
        
        // 0'dan 63'e kadar opaklığı azaltarak solma efekti yapıyoruz
        if (currentFrameIndex <= 63) {
            const opacity = 1 - (currentFrameIndex / 63);
            profileImg.style.opacity = opacity;
        } else {
            profileImg.style.opacity = 0;
        }
        
        // Animasyon karesi olarak çiz (daha akıcı ve performanslı)
        requestAnimationFrame(() => renderFrame(currentFrameIndex));
    }
});
