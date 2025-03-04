const canvas = document.getElementById('book-cover-canvas');
const ctx = canvas.getContext('2d');

const bookCoverImage = new Image();
bookCoverImage.src = '../images/BookCover.png';
bookCoverImage.onload = () => {
    drawBookCover();
};

let currentLightColor = '#ffffff';
let currentDarkColor = ' #796a97';

function drawBookCover() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bookCoverImage, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = currentDarkColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = currentLightColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';

    if (uploadedImage.src) {
        ctx.drawImage(uploadedImage, 20, 20, canvas.width - 40, canvas.height - 70);
    }
}

const colorOptions = document.querySelectorAll('.color-option');

const colors = [
    { light: '#afa1c7', dark: '#706999' },
    { light: '#bb5e59', dark: '#8a4540' },
    { light: '#d2736b', dark: '#a85a54' },
    { light: '#90b3d5', dark: '#658a60' },
    { light: '#87a56f', dark: '#5e8796' },
    { light: '#efde8c', dark: '#e2ce6a' },
];

colorOptions.forEach((option, index) => {
    option.addEventListener('click', () => {
        currentLightColor = colors[index].light;
        currentDarkColor = colors[index].dark;
        drawBookCover();
        colorOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
    });
});

const bookImageInput = document.querySelector('#book-image');
const uploadedImage = new Image();

bookImageInput.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            uploadedImage.src = e.target.result;
            uploadedImage.onload = () => {
                drawBookCover();
            };
        };
        reader.readAsDataURL(file);
    }
});

const saveButton = document.querySelector('#save-design');
saveButton.addEventListener('click', () => {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'book-cover.png';
    link.click();
});