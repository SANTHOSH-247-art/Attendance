import { useEffect, useRef } from 'react';

const SchoolBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // School-themed elements
    class SchoolElement {
      x: number;
      y: number;
      type: 'book' | 'pencil' | 'ruler' | 'calculator' | 'notebook';
      size: number;
      speed: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
      color: string;
      canvasWidth: number;
      canvasHeight: number;

      constructor(canvasWidth: number, canvasHeight: number) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.type = ['book', 'pencil', 'ruler', 'calculator', 'notebook'][Math.floor(Math.random() * 5)] as any;
        this.size = Math.random() * 20 + 15;
        this.speed = Math.random() * 0.5 + 0.2;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.opacity = Math.random() * 0.3 + 0.1;
        
        // School colors
        const colors = ['#f59e0b', '#f97316', '#ef4444', '#8b5cf6', '#06b6d4'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.y += this.speed;
        this.rotation += this.rotationSpeed;
        
        // Reset when off screen
        if (this.y > this.canvasHeight + 50) {
          this.y = -50;
          this.x = Math.random() * this.canvasWidth;
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        switch (this.type) {
          case 'book':
            this.drawBook(ctx);
            break;
          case 'pencil':
            this.drawPencil(ctx);
            break;
          case 'ruler':
            this.drawRuler(ctx);
            break;
          case 'calculator':
            this.drawCalculator(ctx);
            break;
          case 'notebook':
            this.drawNotebook(ctx);
            break;
        }
        
        ctx.restore();
      }

      drawBook(ctx: CanvasRenderingContext2D) {
        // Book cover
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/3, this.size, this.size/1.5);
        
        // Book pages
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(-this.size/2 + 2, -this.size/3 + 2, this.size - 4, this.size/1.5 - 4);
        
        // Book spine
        ctx.fillStyle = '#334155';
        ctx.fillRect(-this.size/2, -this.size/3, 3, this.size/1.5);
      }

      drawPencil(ctx: CanvasRenderingContext2D) {
        // Pencil body
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/8, -this.size/2, this.size/4, this.size);
        
        // Pencil tip
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(-this.size/8, this.size/2);
        ctx.lineTo(0, this.size/2 + 8);
        ctx.lineTo(this.size/8, this.size/2);
        ctx.closePath();
        ctx.fill();
        
        // Eraser
        ctx.fillStyle = '#f87171';
        ctx.fillRect(-this.size/8, -this.size/2 - 4, this.size/4, 4);
      }

      drawRuler(ctx: CanvasRenderingContext2D) {
        // Ruler body
        ctx.fillStyle = '#334155';
        ctx.fillRect(-this.size/2, -this.size/8, this.size, this.size/4);
        
        // Measurement marks
        ctx.fillStyle = '#f1f5f9';
        for (let i = 0; i < 12; i++) {
          const height = i % 4 === 0 ? 8 : i % 2 === 0 ? 6 : 4;
          ctx.fillRect(-this.size/2 + (i * this.size/12), -height/2, 1, height);
        }
      }

      drawCalculator(ctx: CanvasRenderingContext2D) {
        // Calculator body
        ctx.fillStyle = '#334155';
        ctx.fillRect(-this.size/2, -this.size/3, this.size, this.size/1.5);
        
        // Screen
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-this.size/3, -this.size/4, this.size/1.5, this.size/6);
        
        // Buttons
        ctx.fillStyle = '#475569';
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            ctx.fillRect(-this.size/2.5 + (i * this.size/4), this.size/8 + (j * this.size/6), this.size/6, this.size/8);
          }
        }
      }

      drawNotebook(ctx: CanvasRenderingContext2D) {
        // Notebook cover
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2.5, this.size, this.size/1.2);
        
        // Spiral binding
        ctx.fillStyle = '#64748b';
        for (let i = 0; i < 8; i++) {
          ctx.beginPath();
          ctx.arc(-this.size/2 + 3, -this.size/2.5 + 8 + (i * this.size/10), 2, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Lines
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.moveTo(-this.size/2 + 8, -this.size/2.5 + 15 + (i * this.size/8));
          ctx.lineTo(this.size/2 - 5, -this.size/2.5 + 15 + (i * this.size/8));
          ctx.stroke();
        }
      }
    }

    // Create school elements
    const elements: SchoolElement[] = [];
    const elementCount = 25;
    
    for (let i = 0; i < elementCount; i++) {
      elements.push(new SchoolElement(canvas.width, canvas.height));
    }

    // Animation loop
    const animate = () => {
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      elements.forEach(element => {
        element.update();
        element.draw(ctx);
      });
      
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};

export default SchoolBackground;