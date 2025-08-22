// Classe principal da calculadora
class QuadraticCalculator {
    constructor() {
        this.initializeElements();
        this.initializeChart();
        this.initializeDecompositionChart();
        this.setupEventListeners();
        this.setupSliderSync();
        this.currentTheme = 'light';
        this.physicsMode = false;
        this.animationFrame = null;
        this.zoomLevel = 1;
        
        // Inicialização com delay para garantir que o DOM está pronto
        setTimeout(() => {
            this.calculate();
            this.updateZoomDisplay();
        }, 100);
    }

    initializeElements() {
        // Parâmetros
        this.paramA = document.getElementById('param-a');
        this.paramB = document.getElementById('param-b');
        this.paramC = document.getElementById('param-c');
        this.sliderA = document.getElementById('slider-a');
        this.sliderB = document.getElementById('slider-b');
        this.sliderC = document.getElementById('slider-c');

        // Controles
        this.calculateBtn = document.getElementById('calculateBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.animateBtn = document.getElementById('animateBtn');
        this.themeToggle = document.getElementById('themeToggle');
        this.physicsToggle = document.getElementById('physicsToggle');

        // Personalização
        this.curveColor = document.getElementById('curveColor');
        this.showGrid = document.getElementById('showGrid');
        this.showPoints = document.getElementById('showPoints');
        this.showVertex = document.getElementById('showVertex');
        this.showRoots = document.getElementById('showRoots');
        this.showCoordinates = document.getElementById('showCoordinates');
        this.autoScale = document.getElementById('autoScale');
        this.exportPdfBtn = document.getElementById('exportPdfBtn');

        // Zoom
        this.zoomIn = document.getElementById('zoomIn');
        this.zoomOut = document.getElementById('zoomOut');
        this.resetZoom = document.getElementById('resetZoom');
        this.zoomLevelDisplay = document.getElementById('zoomLevel');

        // Decomposição
        this.showQuadratic = document.getElementById('showQuadratic');
        this.showLinear = document.getElementById('showLinear');
        this.showConstant = document.getElementById('showConstant');
        this.showAll = document.getElementById('showAll');

        // Resultados
        this.discriminantEl = document.getElementById('discriminant');
        this.vertexEl = document.getElementById('vertex');
        this.axisEl = document.getElementById('axis');
        this.rootsEl = document.getElementById('roots');
        this.concavityEl = document.getElementById('concavity');
        this.vertexValueEl = document.getElementById('vertexValue');

        // Elementos de UI
        this.loading = document.getElementById('loading');
        this.toast = document.getElementById('toast');
        this.projectile = document.getElementById('projectile');
    }

    // Atualização na configuração do chart para melhor visualização
    initializeChart() {
        const ctx = document.getElementById('quadraticChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'f(x) = ax² + bx + c',
                    data: [],
                    borderColor: '#64748b',
                    backgroundColor: 'rgba(100, 116, 139, 0.08)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.1,
                    pointRadius: 0,
                    pointHoverRadius: 0
                }, {
                    label: 'Eixo X (y=0)',
                    data: [],
                    borderColor: 'rgba(0, 0, 0, 0.7)',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    borderWidth: 2,
                    borderDash: [8, 4],
                    pointRadius: 0,
                    showLine: true,
                    fill: false,
                    hidden: false
                }, {
                    label: 'Vértice',
                    data: [],
                    borderColor: '#6366f1',
                    backgroundColor: '#6366f1',
                    borderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    showLine: false,
                    pointStyle: 'circle',
                    hidden: false
                }, {
                    label: 'Raízes (cortes no eixo X)',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: '#10b981',
                    borderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    showLine: false,
                    pointStyle: 'circle',
                    hidden: false
                }, {
                    label: 'Interseção Y (0, c)',
                    data: [],
                    borderColor: '#f97316',
                    backgroundColor: '#f97316',
                    borderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    showLine: false,
                    pointStyle: 'circle',
                    hidden: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            filter: function(item) {
                                // Ocultar datasets vazios da legenda
                                return item.text !== 'Eixo X (y=0)';
                            },
                            usePointStyle: true,
                            pointStyle: 'rect',
                            boxWidth: 12,
                            boxHeight: 12,
                            padding: 15,
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        },

                        onClick: function(event, legendItem, legend) {
                            // Animação personalizada ao clicar
                            const index = legendItem.datasetIndex;
                            const chart = legend.chart;
                            const meta = chart.getDatasetMeta(index);
                            
                            // Toggle da visibilidade com animação
                            meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
                            
                            // Animação suave ao mostrar/ocultar com transição
                            chart.update('active', {
                                duration: 800,
                                easing: 'easeInOutQuart'
                            });
                            
                            // Feedback visual temporário
                            const canvas = chart.canvas;
                            canvas.style.transform = 'scale(0.98)';
                            setTimeout(() => {
                                canvas.style.transform = 'scale(1)';
                            }, 150);
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#1e293b',
                        bodyColor: '#475569',
                        borderColor: '#3b82f6',
                        borderWidth: 2,
                        cornerRadius: 10,
                        padding: 12,
                        displayColors: false,
                        titleFont: {
                            size: 16,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 14,
                            weight: '500'
                        },
                        callbacks: {
                            title: function(context) {
                                return `Coordenada: x = ${context[0].parsed.x.toFixed(3)}`;
                            },
                            label: function(context) {
                                const value = context.parsed.y.toFixed(3);
                                if (context.datasetIndex === 1) {
                                    return `📍 Eixo X: y = 0`;
                                } else if (context.datasetIndex === 2) {
                                    return `🟣 Vértice: (${context.parsed.x.toFixed(3)}, ${value})`;
                                } else if (context.datasetIndex === 3) {
                                    // Para raízes, mostrar todas as raízes disponíveis
                                    const { a, b, c } = this.getCoefficients();
                                    const roots = this.calculateRoots(a, b, c);
                                    if (roots.length === 1) {
                                        return `🟢 Raiz: x = ${roots[0].toFixed(3)}`;
                                    } else if (roots.length === 2) {
                                        return `🟢 Raízes: x₁ = ${roots[0].toFixed(3)}, x₂ = ${roots[1].toFixed(3)}`;
                                    } else {
                                        return `🟢 Raiz: x = ${context.parsed.x.toFixed(3)}`;
                                    }
                                } else if (context.datasetIndex === 4) {
                                    return `🟠 Interseção Y: (0, ${value})`;
                                } else {
                                    return `📊 ${context.dataset.label}: y = ${value}`;
                                }
                            }.bind(this)
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'center',
                        grid: {
                            display: true,
                            color: function(context) {
                                // Destacar o eixo X (x=0) com cor baseada no tema
                                const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                                if (context.tick.value === 0) {
                                    return isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)';
                                }
                                return isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';
                            },
                            lineWidth: function(context) {
                                return context.tick.value === 0 ? 2 : 1;
                            }
                        },
                        title: {
                            display: true,
                            text: 'x',
                            font: { size: 14, weight: 'bold' },
                            color: function() {
                                // Retornar cor baseada no tema atual
                                return document.documentElement.getAttribute('data-theme') === 'dark' 
                                    ? '#ffffff' 
                                    : 'rgba(0, 0, 0, 0.9)';
                            }
                        },
                        ticks: {
                            color: function() {
                                // Retornar cor baseada no tema atual
                                return document.documentElement.getAttribute('data-theme') === 'dark' 
                                    ? '#ffffff' 
                                    : 'rgba(0, 0, 0, 0.9)';
                            },
                            font: { size: 12, weight: '600' }
                        }
                    },
                    y: {
                        type: 'linear',
                        position: 'center',
                        grid: {
                            display: true,
                            color: function(context) {
                                // Destacar o eixo Y (y=0) com cor baseada no tema
                                const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                                if (context.tick.value === 0) {
                                    return isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)';
                                }
                                return isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)';
                            },
                            lineWidth: function(context) {
                                return context.tick.value === 0 ? 2 : 1;
                            }
                        },
                        title: {
                            display: true,
                            text: 'f(x)',
                            font: { size: 14, weight: 'bold' },
                            color: function() {
                                // Retornar cor baseada no tema atual
                                return document.documentElement.getAttribute('data-theme') === 'dark' 
                                    ? '#ffffff' 
                                    : 'rgba(0, 0, 0, 0.9)';
                            }
                        },
                        ticks: {
                            color: function() {
                                // Retornar cor baseada no tema atual
                                return document.documentElement.getAttribute('data-theme') === 'dark' 
                                    ? '#ffffff' 
                                    : 'rgba(0, 0, 0, 0.9)';
                            },
                            font: { size: 12, weight: '600' }
                        }
                    }
                },
                animation: {
                    duration: 600,
                    easing: 'easeInOutQuart'
                }
            }
        });

        // Sistema de zoom simplificado
        const canvas = this.chart.canvas;
        
        // Sistema de navegação por toque para dispositivos móveis
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartDistance = 0;
        let isTouching = false;
        let isPinching = false;
        let lastTouchTime = 0;
        let initialScale = 1;
        let hasMoved = false;

        // Prevenir zoom padrão do navegador e gerenciar toques
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (e.touches.length === 1) {
                // Toque único - iniciar pan
                const touch = e.touches[0];
                touchStartX = touch.clientX;
                touchStartY = touch.clientY;
                isTouching = true;
                hasMoved = false;
                
                // Adicionar classe visual
                canvas.parentElement.classList.add('touching');
                lastTouchTime = Date.now();
                
            } else if (e.touches.length === 2) {
                // Dois toques - iniciar zoom com pinça
                isPinching = true;
                canvas.parentElement.classList.add('pinching');
                
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                touchStartDistance = Math.sqrt(
                    Math.pow(touch1.clientX - touch2.clientX, 2) +
                    Math.pow(touch1.clientY - touch2.clientY, 2)
                );
                
                // Salvar escala inicial
                initialScale = this.zoomLevel;
            }
        }, { passive: false });

        // Gerenciar movimento do toque
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (isTouching && e.touches.length === 1) {
                // Pan com um dedo
                const touch = e.touches[0];
                const deltaX = touch.clientX - touchStartX;
                const deltaY = touch.clientY - touchStartY;
                
                // Verificar se houve movimento significativo (threshold de 8px)
                if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
                    hasMoved = true;
                }
                
                // Aplicar pan mais suave
                const xRange = this.chart.options.scales.x.max - this.chart.options.scales.x.min;
                const yRange = this.chart.options.scales.y.max - this.chart.options.scales.y.min;
                
                const canvasRect = canvas.getBoundingClientRect();
                const xStep = xRange / canvasRect.width;
                const yStep = yRange / canvasRect.height;
                
                // Pan mais responsivo
                this.chart.options.scales.x.min -= deltaX * xStep * 0.8;
                this.chart.options.scales.x.max -= deltaX * xStep * 0.8;
                this.chart.options.scales.y.min += deltaY * yStep * 0.8;
                this.chart.options.scales.y.max += deltaY * yStep * 0.8;
                
                this.chart.update('none');
                
                // Atualizar posição inicial
                touchStartX = touch.clientX;
                touchStartY = touch.clientY;
                
            } else if (isPinching && e.touches.length === 2) {
                // Zoom com pinça
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = Math.sqrt(
                    Math.pow(touch1.clientX - touch2.clientX, 2) +
                    Math.pow(touch1.clientY - touch2.clientY, 2)
                );
                
                if (touchStartDistance > 0) {
                    const scale = currentDistance / touchStartDistance;
                    const zoomFactor = scale > 1 ? 1.05 : 0.95;
                    
                    // Aplicar zoom mais suave
                    this.zoomLevel = initialScale * scale;
                    this.zoomLevel = Math.max(0.1, Math.min(10, this.zoomLevel));
                    
                    // Atualizar display
                    this.updateZoomDisplay();
                    
                    // Aplicar zoom ao gráfico
                    const centerX = (this.chart.options.scales.x.max + this.chart.options.scales.x.min) / 2;
                    const centerY = (this.chart.options.scales.y.max + this.chart.options.scales.y.min) / 2;
                    
                    const xRange = this.chart.options.scales.x.max - this.chart.options.scales.x.min;
                    const yRange = this.chart.options.scales.y.max - this.chart.options.scales.y.min;
                    
                    const newXRange = xRange / zoomFactor;
                    const newYRange = yRange / zoomFactor;
                    
                    const xHalfRange = newXRange / 2;
                    const yHalfRange = newYRange / 2;
                    
                    this.chart.options.scales.x.min = centerX - xHalfRange;
                    this.chart.options.scales.x.max = centerX + xHalfRange;
                    this.chart.options.scales.y.min = centerY - yHalfRange;
                    this.chart.options.scales.y.max = centerY + yHalfRange;
                    
                    this.chart.update('none');
                }
            }
        }, { passive: false });

        // Finalizar toque
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (isTouching) {
                isTouching = false;
                canvas.parentElement.classList.remove('touching');
                
                // Verificar se foi um toque rápido (não pan)
                const touchDuration = Date.now() - lastTouchTime;
                if (touchDuration < 300 && !hasMoved) {
                    // Toque rápido sem movimento - resetar zoom
                    this.resetZoomLevel();
                    this.showToast('Zoom resetado!', 'success');
                }
                
                hasMoved = false;
            }
            
            if (isPinching) {
                isPinching = false;
                canvas.parentElement.classList.remove('pinching');
                touchStartDistance = 0;
                initialScale = 1;
            }
        }, { passive: false });

        // Cancelar toque
        canvas.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            isTouching = false;
            isPinching = false;
            canvas.parentElement.classList.remove('touching', 'pinching');
            touchStartDistance = 0;
            initialScale = 1;
            hasMoved = false;
        }, { passive: false });

        // Clique específico para mobile (toque rápido)
        canvas.addEventListener('click', (e) => {
            // Verificar se é um dispositivo móvel
            if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
                // Em mobile, verificar se foi um toque rápido sem movimento
                const touchDuration = Date.now() - lastTouchTime;
                if (touchDuration < 300 && !hasMoved) {
                    e.preventDefault();
                    this.resetZoomLevel();
                    this.showToast('Zoom resetado!', 'success');
                }
            }
        });
        
        // Zoom com scroll do mouse (apenas para desktop)
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            // Fator de zoom simples
            const factor = e.deltaY > 0 ? 0.8 : 1.2;
            
            // Aplicar zoom
            this.simpleZoom(factor);
        });

        // Pan simples com botão direito
        let isPanning = false;
        let lastPanPoint = null;

        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 2) {
                e.preventDefault();
                isPanning = true;
                lastPanPoint = { x: e.clientX, y: e.clientY };
                canvas.style.cursor = 'grabbing';
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            if (isPanning && lastPanPoint) {
                e.preventDefault();
                
                const deltaX = e.clientX - lastPanPoint.x;
                const deltaY = e.clientY - lastPanPoint.y;
                
                // Pan simples
                const xRange = this.chart.options.scales.x.max - this.chart.options.scales.x.min;
                const yRange = this.chart.options.scales.y.max - this.chart.options.scales.y.min;
                
                const canvasRect = canvas.getBoundingClientRect();
                const xStep = xRange / canvasRect.width;
                const yStep = yRange / canvasRect.height;
                
                this.chart.options.scales.x.min -= deltaX * xStep;
                this.chart.options.scales.x.max -= deltaX * xStep;
                this.chart.options.scales.y.min += deltaY * yStep;
                this.chart.options.scales.y.max += deltaY * yStep;
                
                this.chart.update('none');
                lastPanPoint = { x: e.clientX, y: e.clientY };
            }
        });

        canvas.addEventListener('mouseup', (e) => {
            if (e.button === 2 && isPanning) {
                isPanning = false;
                lastPanPoint = null;
                canvas.style.cursor = 'default';
            }
        });

        canvas.addEventListener('mouseleave', () => {
            if (isPanning) {
                isPanning = false;
                lastPanPoint = null;
                canvas.style.cursor = 'default';
            }
        });
    }

    initializeDecompositionChart() {
        const ctx = document.getElementById('decompChart').getContext('2d');
        this.decompChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'ax²',
                    data: [],
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    hidden: true
                }, {
                    label: 'bx',
                    data: [],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    hidden: true
                }, {
                    label: 'c',
                    data: [],
                    borderColor: '#f97316',
                    backgroundColor: 'rgba(249, 115, 22, 0.08)',
                    borderWidth: 2,
                    fill: false,
                    hidden: true
                }, {
                    label: 'Total',
                    data: [],
                    borderColor: '#64748b',
                    backgroundColor: 'rgba(100, 116, 139, 0.08)',
                    borderWidth: 3,
                    fill: false,
                    hidden: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            pointStyle: 'rect',
                            boxWidth: 12,
                            boxHeight: 12,
                            padding: 15,
                            font: {
                                size: 12,
                                weight: 500
                            }
                        },

                        onClick: function(event, legendItem, legend) {
                            const index = legendItem.datasetIndex;
                            const chart = legend.chart;
                            const meta = chart.getDatasetMeta(index);
                            
                            meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
                            chart.update('active');
                            
                            const canvas = chart.canvas;
                            canvas.style.transform = 'scale(0.98)';
                            setTimeout(() => {
                                canvas.style.transform = 'scale(1)';
                            }, 150);
                        }
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'nearest',
                        intersect: true,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#1e293b',
                        bodyColor: '#475569',
                        borderColor: '#3b82f6',
                        borderWidth: 2,
                        cornerRadius: 10,
                        padding: 12,
                        displayColors: false,
                        titleFont: {
                            size: 16,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 14,
                            weight: '500'
                        },
                        callbacks: {
                            title: function(context) {
                                return `Coordenada: x = ${context[0].parsed.x.toFixed(3)}`;
                            },
                            label: function(context) {
                                const value = context.parsed.y.toFixed(3);
                                return `📊 ${context.dataset.label}: y = ${value}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        position: 'center'
                    },
                    y: {
                        type: 'linear',
                        position: 'center'
                    }
                },
                animation: {
                    duration: 800
                }
            }
        });
    }

    setupEventListeners() {
        // Parâmetros
        [this.paramA, this.paramB, this.paramC].forEach(input => {
            input.addEventListener('input', () => this.calculate());
        });

        // Botões principais
        this.calculateBtn.addEventListener('click', () => this.calculate());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.animateBtn.addEventListener('click', () => this.animateProjectile());

        // Tema e modo física
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.physicsToggle.addEventListener('click', () => this.togglePhysicsMode());

        // Personalização
        this.curveColor.addEventListener('change', () => this.updateChartStyle());
        [this.showGrid, this.showPoints, this.showVertex, this.showRoots, this.showCoordinates, this.autoScale].forEach(checkbox => {
            checkbox.addEventListener('change', () => this.updateChartStyle());
        });

        // Exportação
        this.exportPdfBtn.addEventListener('click', () => this.exportToPdf());

        // Zoom
        this.zoomIn.addEventListener('click', () => this.simpleZoom(1.5));
        this.zoomOut.addEventListener('click', () => this.simpleZoom(0.7));
        this.resetZoom.addEventListener('click', () => this.resetZoomLevel());

        // Decomposição
        this.showQuadratic.addEventListener('click', () => this.toggleDecomposition(0));
        this.showLinear.addEventListener('click', () => this.toggleDecomposition(1));
        this.showConstant.addEventListener('click', () => this.toggleDecomposition(2));
        this.showAll.addEventListener('click', () => this.showAllDecomposition());
    }

    setupSliderSync() {
        // Sincronizar sliders com inputs
        this.sliderA.addEventListener('input', () => {
            this.paramA.value = this.sliderA.value;
            this.calculate();
        });

        this.sliderB.addEventListener('input', () => {
            this.paramB.value = this.sliderB.value;
            this.calculate();
        });

        this.sliderC.addEventListener('input', () => {
            this.paramC.value = this.sliderC.value;
            this.calculate();
        });

        // Sincronizar inputs com sliders
        this.paramA.addEventListener('input', () => {
            this.sliderA.value = this.paramA.value;
        });

        this.paramB.addEventListener('input', () => {
            this.sliderB.value = this.paramB.value;
        });

        this.paramC.addEventListener('input', () => {
            this.sliderC.value = this.paramC.value;
        });
    }

    getCoefficients() {
        return {
            a: parseFloat(this.paramA.value) || 0,
            b: parseFloat(this.paramB.value) || 0,
            c: parseFloat(this.paramC.value) || 0
        };
    }

    calculateQuadratic(x, a, b, c) {
        return a * x * x + b * x + c;
    }

    calculateVertex(a, b, c) {
        if (a === 0) return null;
        const x = -b / (2 * a);
        const y = this.calculateQuadratic(x, a, b, c);
        return { x, y };
    }

    // Método melhorado para cálculo de raízes com maior precisão
    calculateRoots(a, b, c) {
        // Se a = 0, é uma função linear
        if (Math.abs(a) < 1e-10) {
            if (Math.abs(b) < 1e-10) return []; // Função constante
            const root = -c / b;
            return isFinite(root) ? [root] : [];
        }

        const discriminant = b * b - 4 * a * c;
        
        if (discriminant < -1e-10) {
            return []; // Sem raízes reais
        }
        
        if (Math.abs(discriminant) < 1e-10) {
            // Uma raiz (discriminante ≈ 0)
            const root = -b / (2 * a);
            return isFinite(root) ? [root] : [];
        }
        
        // Duas raízes distintas
        const sqrtDiscriminant = Math.sqrt(discriminant);
        const root1 = (-b + sqrtDiscriminant) / (2 * a);
        const root2 = (-b - sqrtDiscriminant) / (2 * a);
        
        const roots = [root1, root2].filter(root => isFinite(root));
        return roots.sort((a, b) => a - b); // Ordenar as raízes
    }

    calculateDiscriminant(a, b, c) {
        return b * b - 4 * a * c;
    }

    generateChartData() {
        const { a, b, c } = this.getCoefficients();
        
        // Range baseado no zoom com limites de segurança
        let baseRange = 20;
        
        // Verificar se precisamos de um range maior baseado nas raízes
        const roots = this.calculateRoots(a, b, c);
        if (roots.length >= 2) {
            const minRoot = Math.min(...roots);
            const maxRoot = Math.max(...roots);
            const rootSpread = Math.abs(maxRoot - minRoot);
            // Garantir que o range seja pelo menos 2x maior que a distância entre as raízes
            const minRequiredRange = Math.max(20, rootSpread * 2.5);
            baseRange = Math.max(baseRange, minRequiredRange);
        }
        
        const range = Math.max(2, Math.min(100, baseRange / this.zoomLevel));
        
        // Calcular step adaptativo baseado no zoom
        let stepCount = 400; // Aumentado para mais precisão
        if (this.zoomLevel > 4) stepCount = 600; // Mais pontos para zoom alto
        if (this.zoomLevel < 0.5) stepCount = 300; // Menos pontos para zoom baixo
        
        const step = range / stepCount;
        const data = [];

        // Range expandido com limites de segurança
        const extendedRange = Math.min(200, range * 1.5); // Aumentado para 1.5

        for (let x = -extendedRange/2; x <= extendedRange/2; x += step) {
            const y = this.calculateQuadratic(x, a, b, c);
            
            // Filtros de segurança mais rigorosos
            if (isFinite(y) && Math.abs(y) < 100000 && !isNaN(y)) {
                data.push({ 
                    x: parseFloat(x.toFixed(6)), 
                    y: parseFloat(y.toFixed(6)) 
                });
            }
        }

        // Verificar se temos dados suficientes
        if (data.length < 10) {
            // Fallback para casos extremos
            const fallbackRange = 20;
            const fallbackStep = fallbackRange / 200; // Mais pontos no fallback
            data.length = 0;
            
            for (let x = -fallbackRange/2; x <= fallbackRange/2; x += fallbackStep) {
                const y = this.calculateQuadratic(x, a, b, c);
                if (isFinite(y) && Math.abs(y) < 1000) {
                    data.push({ x: parseFloat(x.toFixed(3)), y: parseFloat(y.toFixed(3)) });
                }
            }
        }

        return { data, range: extendedRange };
    }

    updateChart() {
        try {
            const { data, range } = this.generateChartData();
            const { a, b, c } = this.getCoefficients();

            // Verificar se temos dados válidos
            if (!data || data.length === 0) {
                this.showToast('Erro: Não foi possível gerar dados do gráfico', 'error');
                return;
            }

            // Atualizar dados principais
            this.chart.data.datasets[0].data = data;
            this.chart.data.datasets[0].borderColor = this.curveColor.value;

            // Aplicar auto-scaling apenas se não houver zoom manual
            if (this.autoScale && this.autoScale.checked && this.zoomLevel === 1) {
                // Escala automática simples
                const vertex = this.calculateVertex(a, b, c);
                const roots = this.calculateRoots(a, b, c);
                
                let xMin = -10;
                let xMax = 10;
                
                // Ajustar baseado em pontos importantes
                if (roots.length > 0) {
                    const validRoots = roots.filter(root => isFinite(root) && Math.abs(root) < 1000);
                    if (validRoots.length > 0) {
                        const minRoot = Math.min(...validRoots);
                        const maxRoot = Math.max(...validRoots);
                        const margin = Math.max((maxRoot - minRoot) * 0.5, 2);
                        
                        xMin = Math.max(-100, minRoot - margin);
                        xMax = Math.min(100, maxRoot + margin);
                    }
                }
                
                if (vertex && isFinite(vertex.x)) {
                    const margin = Math.max(Math.abs(vertex.x) * 0.3, 2);
                    xMin = Math.max(-100, Math.min(xMin, vertex.x - margin));
                    xMax = Math.min(100, Math.max(xMax, vertex.x + margin));
                }
                
                // Calcular Y baseado nos dados visíveis
                const visibleData = data.filter(point => 
                    point.x >= xMin && point.x <= xMax && 
                    isFinite(point.y) && Math.abs(point.y) < 10000
                );
                
                if (visibleData.length > 0) {
                    const yValues = visibleData.map(point => point.y);
                    const yMin = Math.min(...yValues);
                    const yMax = Math.max(...yValues);
                    const yMargin = Math.max((yMax - yMin) * 0.2, 1);
                    
                    this.chart.options.scales.x.min = xMin;
                    this.chart.options.scales.x.max = xMax;
                    this.chart.options.scales.y.min = Math.max(-1000, yMin - yMargin);
                    this.chart.options.scales.y.max = Math.min(1000, yMax + yMargin);
                }
            }

            // Atualizar pontos de interesse
            this.updateInterestPoints(a, b, c);

            this.chart.update('none');
            
        } catch (error) {
            console.error('Erro ao atualizar gráfico:', error);
            this.showToast('Erro ao atualizar gráfico', 'error');
        }
    }

    // Método aprimorado para atualizar pontos de interesse
    updateInterestPoints(a, b, c) {
        const xMin = this.chart.options.scales.x.min;
        const xMax = this.chart.options.scales.x.max;
        const yMin = this.chart.options.scales.y.min;
        const yMax = this.chart.options.scales.y.max;

        // Linha do eixo X (y=0) - sempre visível quando y=0 está no range
        if (yMin <= 0 && yMax >= 0) {
            this.chart.data.datasets[1].data = [
                { x: xMin, y: 0 },
                { x: xMax, y: 0 }
            ];
        } else {
            this.chart.data.datasets[1].data = [];
        }

        // Vértice
        const vertex = this.calculateVertex(a, b, c);
        if (vertex && this.showVertex.checked && 
            isFinite(vertex.x) && isFinite(vertex.y) &&
            vertex.x >= xMin && vertex.x <= xMax && 
            vertex.y >= yMin && vertex.y <= yMax) {
            this.chart.data.datasets[2].data = [vertex];
            this.chart.data.datasets[2].hidden = false;
            console.log('Vértice adicionado:', vertex);
        } else {
            this.chart.data.datasets[2].data = [];
            console.log('Vértice não exibido:', { vertex, showVertex: this.showVertex.checked, xRange: [xMin, xMax], yRange: [yMin, yMax] });
        }

        // Raízes (pontos onde a função corta o eixo X) - VISUALIZAÇÃO MELHORADA
        const roots = this.calculateRoots(a, b, c);
        if (roots.length > 0 && this.showRoots.checked) {
            const visibleRoots = roots.filter(root => 
                isFinite(root) && Math.abs(root) < 10000 &&
                root >= xMin && root <= xMax
            );
            
            this.chart.data.datasets[3].data = visibleRoots.map(root => ({
                x: parseFloat(root.toFixed(6)),
                y: 0
            }));
            this.chart.data.datasets[3].hidden = false;
            
            // Manter as cores e tamanhos definidos na configuração inicial
            // As cores já estão definidas corretamente no dataset
        } else {
            this.chart.data.datasets[3].data = [];
        }

        // Adicionar ponto de interseção com eixo Y (0, c)
        if (xMin <= 0 && xMax >= 0 && yMin <= c && yMax >= c && this.showPoints && this.showPoints.checked) {
            // Se não existe dataset para interseção Y, criar um
            if (!this.chart.data.datasets[4]) {
                this.chart.data.datasets[4] = {
                    label: 'Interseção Y (0, c)',
                    data: [],
                    borderColor: '#f97316',
                    backgroundColor: '#f97316',
                    borderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    showLine: false,
                    pointStyle: 'circle'
                };
            }
            
            this.chart.data.datasets[4].data = [{
                x: 0,
                y: parseFloat(c.toFixed(6))
            }];
            this.chart.data.datasets[4].hidden = false;
            console.log('Interseção Y adicionada:', { x: 0, y: c });
        } else if (this.chart.data.datasets[4]) {
            this.chart.data.datasets[4].data = [];
            console.log('Interseção Y não exibida:', { xMin, xMax, yMin, yMax, c, showPoints: this.showPoints.checked });
        }


    }

    updateDecompositionChart() {
        const { a, b, c } = this.getCoefficients();
        const range = 10;
        const step = 0.2;
        const labels = [];
        const quadraticData = [];
        const linearData = [];
        const constantData = [];
        const totalData = [];

        for (let x = -range; x <= range; x += step) {
            labels.push(x.toFixed(1));
            quadraticData.push({ x: x, y: a * x * x });
            linearData.push({ x: x, y: b * x });
            constantData.push({ x: x, y: c });
            totalData.push({ x: x, y: this.calculateQuadratic(x, a, b, c) });
        }

        this.decompChart.data.labels = labels;
        this.decompChart.data.datasets[0].data = quadraticData;
        this.decompChart.data.datasets[1].data = linearData;
        this.decompChart.data.datasets[2].data = constantData;
        this.decompChart.data.datasets[3].data = totalData;

        this.decompChart.update('none');
    }

    updateResults() {
        const { a, b, c } = this.getCoefficients();
        
        // Discriminante
        const discriminant = this.calculateDiscriminant(a, b, c);
        this.discriminantEl.textContent = discriminant.toFixed(3);
        this.discriminantEl.className = 'value';
        if (discriminant > 0) this.discriminantEl.classList.add('positive');
        else if (discriminant < 0) this.discriminantEl.classList.add('negative');

        // Vértice
        const vertex = this.calculateVertex(a, b, c);
        if (vertex) {
            this.vertexEl.textContent = `(${vertex.x.toFixed(3)}, ${vertex.y.toFixed(3)})`;
            this.vertexValueEl.textContent = vertex.y.toFixed(3);
        } else {
            this.vertexEl.textContent = 'N/A';
            this.vertexValueEl.textContent = 'N/A';
        }

        // Eixo de simetria
        if (a !== 0) {
            const axis = -b / (2 * a);
            this.axisEl.textContent = `x = ${axis.toFixed(3)}`;
        } else {
            this.axisEl.textContent = 'N/A';
        }

        // Raízes
        const roots = this.calculateRoots(a, b, c);
        if (roots.length === 0) {
            this.rootsEl.textContent = 'Sem raízes reais';
        } else if (roots.length === 1) {
            this.rootsEl.textContent = `x = ${roots[0].toFixed(3)}`;
        } else {
            this.rootsEl.textContent = `x₁ = ${roots[0].toFixed(3)}, x₂ = ${roots[1].toFixed(3)}`;
        }

        // Concavidade
        if (a > 0) {
            this.concavityEl.textContent = 'Para cima (U)';
            this.concavityEl.className = 'value positive';
        } else if (a < 0) {
            this.concavityEl.textContent = 'Para baixo (∩)';
            this.concavityEl.className = 'value negative';
        } else {
            this.concavityEl.textContent = 'Função linear';
            this.concavityEl.className = 'value';
        }
    }

    updateChartStyle() {
        // Cor da curva
        this.chart.data.datasets[0].borderColor = this.curveColor.value;
        
        // Grade
        this.chart.options.scales.x.grid.display = this.showGrid.checked;
        this.chart.options.scales.y.grid.display = this.showGrid.checked;

        // Pontos de interesse - CORRIGIDO: índices corretos dos datasets
        this.chart.data.datasets[2].hidden = !this.showVertex.checked;  // Vértice
        this.chart.data.datasets[3].hidden = !this.showRoots.checked;   // Raízes

        // Coordenadas nos tooltips
        this.chart.options.plugins.tooltip.enabled = this.showCoordinates.checked;

        this.chart.update('none');
    }

    calculate() {
        this.showLoading();
        
        setTimeout(() => {
            this.updateChart();
            this.updateDecompositionChart();
            this.updateResults();
            this.updateZoomDisplay();
            this.hideLoading();
            this.showToast('Cálculos atualizados!', 'success');
        }, 300);
    }

    reset() {
        this.paramA.value = '1';
        this.paramB.value = '0';
        this.paramC.value = '0';
        this.sliderA.value = '1';
        this.sliderB.value = '0';
        this.sliderC.value = '0';
        this.curveColor.value = '#64748b';
        this.zoomLevel = 1;
        
        // Reset checkboxes
        this.showGrid.checked = false;
        this.showPoints.checked = true;
        this.showVertex.checked = true;
        this.showRoots.checked = true;
        this.showCoordinates.checked = true;
        this.autoScale.checked = true;

        this.calculate();
        this.showToast('Valores resetados!', 'success');
    }

    zoom(factor) {
        const oldZoom = this.zoomLevel;
        this.zoomLevel *= factor;
        
        // Limites mais conservadores para evitar bugs
        this.zoomLevel = Math.max(0.2, Math.min(8, this.zoomLevel));
        
        // Verificar se o zoom mudou significativamente
        if (Math.abs(this.zoomLevel - oldZoom) > 0.01) {
            this.updateChart();
            this.updateZoomDisplay();
            const percentage = Math.round(this.zoomLevel * 100);
            
            // Avisar quando próximo do limite
            if (this.zoomLevel >= 7.5) {
                this.showToast(`Zoom máximo: ${percentage}%`, 'warning');
            } else if (this.zoomLevel <= 0.25) {
                this.showToast(`Zoom mínimo: ${percentage}%`, 'warning');
            } else {
                this.showToast(`Zoom: ${percentage}%`, 'success');
            }
        }
    }

    // Método de zoom simplificado
    simpleZoom(factor) {
        // Obter ranges atuais
        const xRange = this.chart.options.scales.x.max - this.chart.options.scales.x.min;
        const yRange = this.chart.options.scales.y.max - this.chart.options.scales.y.min;
        
        // Calcular novos ranges
        const newXRange = xRange / factor;
        const newYRange = yRange / factor;
        
        // Calcular centro atual
        const centerX = (this.chart.options.scales.x.max + this.chart.options.scales.x.min) / 2;
        const centerY = (this.chart.options.scales.y.max + this.chart.options.scales.y.min) / 2;
        
        // Aplicar novos limites centrados
        const xHalfRange = newXRange / 2;
        const yHalfRange = newYRange / 2;
        
        this.chart.options.scales.x.min = centerX - xHalfRange;
        this.chart.options.scales.x.max = centerX + xHalfRange;
        this.chart.options.scales.y.min = centerY - yHalfRange;
        this.chart.options.scales.y.max = centerY + yHalfRange;
        
        // Atualizar zoom level
        this.zoomLevel = 20 / newXRange;
        this.zoomLevel = Math.max(0.1, Math.min(10, this.zoomLevel));
        
        // Atualizar display
        this.updateZoomDisplay();
        
        // Atualizar gráfico
        this.chart.update('none');
    }

    resetZoomLevel() {
        this.zoomLevel = 1;
        
        // Resetar as escalas para valores padrão
        this.chart.options.scales.x.min = -10;
        this.chart.options.scales.x.max = 10;
        this.chart.options.scales.y.min = -10;
        this.chart.options.scales.y.max = 10;
        
        // Atualizar gráfico
        this.updateChart();
        this.updateZoomDisplay();
        this.showToast('Zoom resetado para 100%!', 'success');
    }

    updateZoomDisplay() {
        if (this.zoomLevelDisplay) {
            const percentage = Math.round(this.zoomLevel * 100);
            this.zoomLevelDisplay.textContent = `${percentage}%`;
            
            // Classes simples para zoom
            this.zoomLevelDisplay.classList.remove('warning', 'max-zoom', 'min-zoom');
            
            if (this.zoomLevel >= 8) {
                this.zoomLevelDisplay.classList.add('max-zoom');
            } else if (this.zoomLevel <= 0.2) {
                this.zoomLevelDisplay.classList.add('min-zoom');
            } else if (this.zoomLevel >= 6 || this.zoomLevel <= 0.5) {
                this.zoomLevelDisplay.classList.add('warning');
            }
        }
    }

    toggleDecomposition(index) {
        const dataset = this.decompChart.data.datasets[index];
        dataset.hidden = !dataset.hidden;
        this.decompChart.update();
    }

    showAllDecomposition() {
        this.decompChart.data.datasets.forEach(dataset => {
            dataset.hidden = false;
        });
        this.decompChart.update();
    }

    animateProjectile() {
        const { a, b, c } = this.getCoefficients();
        
        if (a >= 0) {
            this.showToast('Para animação de projétil, o coeficiente "a" deve ser negativo!', 'warning');
            return;
        }

        const roots = this.calculateRoots(a, b, c);
        if (roots.length < 2) {
            this.showToast('Para animação de projétil, a parábola deve ter duas raízes!', 'warning');
            return;
        }

        const startX = Math.min(...roots);
        const endX = Math.max(...roots);
        const vertex = this.calculateVertex(a, b, c);

        if (!vertex || vertex.y <= 0) {
            this.showToast('Para animação de projétil, o vértice deve estar acima do eixo x!', 'warning');
            return;
        }

        // Garantir que o gráfico esteja visível (especialmente em celulares)
        this.scrollToGraph();

        this.projectile.classList.add('animating');
        
        const duration = 3000; // 3 segundos
        const startTime = Date.now();
        const chartRect = this.chart.canvas.getBoundingClientRect();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentX = startX + (endX - startX) * progress;
            const currentY = this.calculateQuadratic(currentX, a, b, c);

            // Converter coordenadas do gráfico para pixels
            const xPixel = this.chart.scales.x.getPixelForValue(currentX);
            const yPixel = this.chart.scales.y.getPixelForValue(currentY);

            this.projectile.style.left = `${xPixel}px`;
            this.projectile.style.top = `${yPixel}px`;

            if (progress < 1) {
                this.animationFrame = requestAnimationFrame(animate);
            } else {
                this.projectile.classList.remove('animating');
                this.showToast('Animação concluída!', 'success');
            }
        };

        animate();
    }

    // Desloca suavemente a visualização até a área do gráfico
    scrollToGraph() {
        try {
            const graphCard = document.querySelector('.graph-card') || this.chart?.canvas;
            if (graphCard && typeof graphCard.scrollIntoView === 'function') {
                graphCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        } catch (e) {
            // Fallback simples para navegadores antigos
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        const icon = this.themeToggle.querySelector('.theme-icon');
        icon.textContent = this.currentTheme === 'light' ? '🌙' : '☀️';
        
        this.showToast(`Tema ${this.currentTheme === 'light' ? 'claro' : 'escuro'} ativado!`, 'success');
    }

    togglePhysicsMode() {
        this.physicsMode = !this.physicsMode;
        document.body.classList.toggle('physics-mode', this.physicsMode);
        this.physicsToggle.classList.toggle('active', this.physicsMode);
        
        this.showToast(`Modo física ${this.physicsMode ? 'ativado' : 'desativado'}!`, 'success');
    }

    showLoading() {
        this.loading.classList.remove('hidden');
    }

    hideLoading() {
        this.loading.classList.add('hidden');
    }

    showToast(message, type = 'success') {
        this.toast.textContent = message;
        this.toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }

    async exportToPdf() {
        try {
            this.showLoading();
            this.showToast('Gerando PDF...', 'info');

            // Obter dados da função
            const { a, b, c } = this.getCoefficients();
            const functionText = `f(x) = ${a !== 0 ? `${a}x²` : ''}${b !== 0 ? `${b > 0 ? ' + ' : ' - '}${Math.abs(b)}x` : ''}${c !== 0 ? `${c > 0 ? ' + ' : ' - '}${Math.abs(c)}` : ''}`.replace(/^\+ /, '');

            // Capturar o gráfico
            const chartCanvas = this.chart.canvas;
            const chartImage = await html2canvas(chartCanvas, {
                backgroundColor: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1e293b' : '#ffffff',
                scale: 2,
                useCORS: true,
                allowTaint: true
            });

            // Criar PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('landscape', 'mm', 'a4');
            
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            
            // Título
            pdf.setFontSize(20);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Gráfico de Função Quadrática', pageWidth / 2, 20, { align: 'center' });
            
            // Função
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Função: ${functionText}`, pageWidth / 2, 30, { align: 'center' });
            
            // Data e hora
            const now = new Date();
            const dateStr = now.toLocaleDateString('pt-BR');
            const timeStr = now.toLocaleTimeString('pt-BR');
            pdf.setFontSize(10);
            pdf.text(`Gerado em: ${dateStr} às ${timeStr}`, pageWidth / 2, 40, { align: 'center' });
            
            // Adicionar gráfico
            const chartWidth = 200;
            const chartHeight = (chartImage.height * chartWidth) / chartImage.width;
            const chartX = (pageWidth - chartWidth) / 2;
            const chartY = 50;
            
            pdf.addImage(chartImage, 'PNG', chartX, chartY, chartWidth, chartHeight);
            
            // Informações da função
            const vertex = this.calculateVertex(a, b, c);
            const roots = this.calculateRoots(a, b, c);
            const discriminant = this.calculateDiscriminant(a, b, c);
            
            let infoY = chartY + chartHeight + 20;
            
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Informações da Função:', 20, infoY);
            
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            infoY += 8;
            
            if (vertex) {
                pdf.text(`• Vértice: (${vertex.x.toFixed(3)}, ${vertex.y.toFixed(3)})`, 20, infoY);
                infoY += 6;
            }
            
            if (roots.length > 0) {
                if (roots.length === 1) {
                    pdf.text(`• Raiz: x = ${roots[0].toFixed(3)}`, 20, infoY);
                } else {
                    pdf.text(`• Raízes: x₁ = ${roots[0].toFixed(3)}, x₂ = ${roots[1].toFixed(3)}`, 20, infoY);
                }
                infoY += 6;
            }
            
            pdf.text(`• Discriminante (Δ): ${discriminant.toFixed(3)}`, 20, infoY);
            infoY += 6;
            
            const concavity = a > 0 ? 'Para cima (U)' : a < 0 ? 'Para baixo (∩)' : 'Função linear';
            pdf.text(`• Concavidade: ${concavity}`, 20, infoY);
            
            // Salvar PDF
            const fileName = `grafico_funcao_${a}_${b}_${c}_${Date.now()}.pdf`;
            pdf.save(fileName);
            
            this.hideLoading();
            this.showToast('PDF exportado com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao exportar PDF:', error);
            this.hideLoading();
            this.showToast('Erro ao exportar PDF. Tente novamente.', 'error');
        }
    }
}

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new QuadraticCalculator();
    
    // Adicionar efeitos de entrada
    document.querySelectorAll('.card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('animate-fade-in');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'r':
                    e.preventDefault();
                    calculator.reset();
                    break;
                case 'Enter':
                    e.preventDefault();
                    calculator.calculate();
                    break;
                case 't':
                    e.preventDefault();
                    calculator.toggleTheme();
                    break;
                case 'p':
                    e.preventDefault();
                    calculator.togglePhysicsMode();
                    break;
            }
        }
    });

    // Adicionar tooltip para atalhos
    const shortcuts = [
        { element: calculator.resetBtn, shortcut: 'Ctrl+R' },
        { element: calculator.calculateBtn, shortcut: 'Ctrl+Enter' },
        { element: calculator.themeToggle, shortcut: 'Ctrl+T' },
        { element: calculator.physicsToggle, shortcut: 'Ctrl+P' }
    ];

    shortcuts.forEach(({ element, shortcut }) => {
        if (element) {
            element.title += ` (${shortcut})`;
        }
    });
});

// Service Worker para cache (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}