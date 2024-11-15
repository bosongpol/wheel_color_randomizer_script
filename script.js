class ColorWheel {
    constructor() {
        this.canvas = document.getElementById('wheel');
        this.ctx = this.canvas.getContext('2d');
        this.spinBtn = document.getElementById('spin-btn');
        this.resultText = document.getElementById('result-text');
        
        this.colors = ['red', 'green', 'blue', 'yellow'];
        this.colorNames = ['แดง', 'เขียว', 'น้ำเงิน', 'เหลือง'];
        this.maxPerColor = 38;
        this.currentRotation = 0;
        this.isSpinning = false;
        
        // เก็บข้อมูลการแบ่งกลุ่ม
        this.colorGroups = {};
        this.colorNames.forEach(color => this.colorGroups[color] = []);
        this.availableNumbers = Array.from({length: this.maxPerColor * 4}, (_, i) => i + 1);
        
        // เพิ่ม Event Listener
        this.spinBtn.addEventListener('click', () => this.spin());
        
        // เพิ่ม Event Listener สำหรับปุ่ม Enter
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !this.isSpinning) {
                this.spin();
            }
        });
        
        // วาดวงล้อครั้งแรก
        this.drawWheel();
    }

    drawWheel() {
        const center = this.canvas.width / 2;
        const radius = this.canvas.width / 2 - 10;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // วาดส่วนของวงล้อ
        for (let i = 0; i < this.colors.length; i++) {
            const startAngle = (i * 2 * Math.PI / this.colors.length) + this.currentRotation;
            const endAngle = ((i + 1) * 2 * Math.PI / this.colors.length) + this.currentRotation;
            
            this.ctx.beginPath();
            this.ctx.moveTo(center, center);
            this.ctx.arc(center, center, radius, startAngle, endAngle);
            this.ctx.fillStyle = this.colors[i];
            this.ctx.fill();
            this.ctx.closePath();
            
            // เพิ่มข้อความ
            const midAngle = (startAngle + endAngle) / 2;
            const textRadius = radius * 0.7;
            const x = center + Math.cos(midAngle) * textRadius;
            const y = center + Math.sin(midAngle) * textRadius;
            
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(midAngle + Math.PI/2);
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 16px TH Sarabun New';
            this.ctx.textAlign = 'center';
            const count = this.colorGroups[this.colorNames[i]].length;
            this.ctx.fillText(`สี${this.colorNames[i]}`, 0, 0);
            this.ctx.fillText(`(${count}/${this.maxPerColor})`, 0, 20);
            this.ctx.restore();
        }
        
        // วาดจุดกลาง
        this.ctx.beginPath();
        this.ctx.arc(center, center, 20, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'white';
        this.ctx.fill();
        this.ctx.closePath();
        
        // เพิ่มการวาดลูกศร
        const arrowSize = 30;
        
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(center + radius + 10, center); // จุดเริ่มต้นของลูกศร
        this.ctx.lineTo(center + radius + arrowSize, center - arrowSize/2); // ด้านบนของหัวลูกศร
        this.ctx.lineTo(center + radius + arrowSize, center + arrowSize/2); // ด้านล่างของหัวลูกศร
        this.ctx.closePath();
        
        this.ctx.fillStyle = '#333333';
        this.ctx.fill();
        this.ctx.restore();
    }

    spin() {
        if (this.isSpinning) return;
        
        // ตรวจสอบว่ายังมีเลขให้สุ่มหรือไม่
        if (this.availableNumbers.length === 0) {
            alert('จำนวนคนครบตามที่กำหนดแล้ว!');
            return;
        }

        this.isSpinning = true;
        this.spinBtn.disabled = true;
        
        // สุ่มจำนวนรอบและองศา
        const spins = 3 + Math.random() * 2;
        const extraDegrees = Math.random() * 360;
        const totalRotation = spins * 2 * Math.PI + (extraDegrees * Math.PI / 180);
        
        let currentRotation = 0;
        const animationDuration = 3000; // 3 วินาที
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);
            
            // ใช้ easeOut function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            currentRotation = totalRotation * easeOut;
            this.currentRotation = currentRotation;
            
            this.drawWheel();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.processResult();
            }
        };
        
        requestAnimationFrame(animate);
    }

    processResult() {
        const section = (this.currentRotation % (2 * Math.PI)) / (2 * Math.PI / this.colors.length);
        const colorIndex = (this.colors.length - 1) - Math.floor(section) % this.colors.length;
        const selectedColor = this.colorNames[colorIndex];
        
        // ตรวจสอบว่าสีนี้เต็มหรือยัง
        if (this.colorGroups[selectedColor].length >= this.maxPerColor) {
            alert(`สี${selectedColor}เต็มแล้ว กรุณาหมุนใหม่!`);
            this.isSpinning = false;
            this.spinBtn.disabled = false;
            return;
        }
        
        // สุ่มเลขที่ยังไม่ถูกใช้
        const randomIndex = Math.floor(Math.random() * this.availableNumbers.length);
        const number = this.availableNumbers.splice(randomIndex, 1)[0];
        this.colorGroups[selectedColor].push(number);
        
        // อัพเดทการแสดงผล
        this.resultText.textContent = `หมายเลข ${number} ได้สี${selectedColor}`;
        this.updateStats();
        
        this.isSpinning = false;
        this.spinBtn.disabled = false;
        this.resultText.className = '';
        this.resultText.classList.add(this.colors[colorIndex]);
    }

    updateStats() {
        this.colorNames.forEach((color, index) => {
            const count = this.colorGroups[color].length;
            document.getElementById(`${this.colors[index]}-count`).textContent = 
                `${count}/${this.maxPerColor}`;
        });
    }
}

// เริ่มต้นใช้งาน
window.onload = () => {
    new ColorWheel();
};
