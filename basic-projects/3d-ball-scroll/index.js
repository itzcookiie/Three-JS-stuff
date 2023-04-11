const canvas = document.querySelector('.canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext('2d');
const frameCount = 250;

const currentFrame = (index) => `./assets/${index + 1}.jpg`;
let ball = { frame: 0 };

async function getImages() {
    return Promise.all(Array.from({ length: frameCount }, (_, i) => i).map(frameCountIndex => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = currentFrame(frameCountIndex);
            img.addEventListener('load', () => resolve(img));
        });
    }));
}

// const images = Array.from({ length: frameCount }, (_, i) => i).map(frameCountIndex => {
//     const img = new Image();
//     img.src = currentFrame(frameCountIndex);
//     return img;
// });

// images[0].onload = render;

function render(images) {
    ctx.canvas.width = images[0].width;
    ctx.canvas.height = images[0].height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(images[ball.frame], 0, 0);
}

document.addEventListener('DOMContentLoaded', async () => {
    const images = await getImages();

    gsap.to(ball, {
        frame: frameCount - 1,
        snap: 'frame',
        ease: 'none',
        scrollTrigger: {
            scrub: true,
            pin: 'canvas',
            end: '500%'
            // markers: true
        },
        onUpdate() {
            render(images);
        }
    });
    
    gsap.fromTo('.ball-text', 
        { opacity: 0 }, 
        {
            opacity: 1,
            scrollTrigger: {
                scrub: true,
                start: '50%',
                end: '60%'
            },
            onComplete() {
                gsap.to('.ball-text', { opacity: 0 })
            }
        },
    )

})

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});