<template>
  <Teleport to="body">
    <transition name="crop-fade">
      <div v-if="visible" class="crop-overlay" @click.self="onCancel">
        <div class="crop-modal" role="dialog" aria-modal="true" aria-label="Настройка фото" @click.stop>
          <div class="crop-header">
            <h3 class="crop-title">Настройка фото</h3>
            <p class="crop-sub">Перетащи, увеличь и поверни — так фото будет в профиле</p>
          </div>

          <div
            ref="viewport"
            class="crop-viewport"
            @mousedown="onPointerDown"
            @touchstart.prevent="onTouchStart"
          >
            <div class="crop-mask" aria-hidden="true"></div>
            <img
              v-if="imageSrc"
              ref="imageEl"
              :src="imageSrc"
              class="crop-image"
              :style="imageStyle"
              alt=""
              draggable="false"
              @load="onImageLoad"
            />
          </div>

          <div class="crop-controls">
            <div class="control-row">
              <span class="control-label">Масштаб</span>
              <input
                v-model.number="zoom"
                class="control-range"
                type="range"
                min="1"
                max="3"
                step="0.01"
              />
            </div>
            <div class="control-actions">
              <button type="button" class="control-btn" title="Повернуть влево" @click="rotate(-90)">
                <AppIcon name="rotate-left" :size="18" />
              </button>
              <button type="button" class="control-btn" title="Повернуть вправо" @click="rotate(90)">
                <AppIcon name="rotate-right" :size="18" />
              </button>
              <button type="button" class="control-btn" title="Отразить" @click="flipHorizontal">
                <AppIcon name="flip" :size="18" />
              </button>
              <button type="button" class="control-btn" title="Сбросить" @click="resetTransform">
                <AppIcon name="refresh" :size="18" />
              </button>
            </div>
          </div>

          <div class="crop-footer">
            <button type="button" class="btn-outline" @click="onCancel">Отмена</button>
            <button type="button" class="btn-primary" :disabled="!ready" @click="onApply">
              Применить
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script>
import AppIcon from './AppIcon.vue'

const VIEWPORT = 300
const OUTPUT = 512

export default {
  name: 'PhotoCropModal',
  components: { AppIcon },
  props: {
    visible: { type: Boolean, default: false },
    imageSrc: { type: String, default: '' },
  },
  emits: ['cancel', 'apply'],
  data() {
    return {
      ready: false,
      baseScale: 1,
      zoom: 1,
      panX: 0,
      panY: 0,
      rotation: 0,
      flipX: 1,
      dragging: false,
      dragStartX: 0,
      dragStartY: 0,
      panStartX: 0,
      panStartY: 0,
      naturalW: 0,
      naturalH: 0,
    }
  },
  computed: {
    imageStyle() {
      const scale = this.baseScale * this.zoom
      return {
        transform: `translate(calc(-50% + ${this.panX}px), calc(-50% + ${this.panY}px)) scale(${scale * this.flipX}, ${scale}) rotate(${this.rotation}deg)`,
      }
    },
  },
  watch: {
    visible(open) {
      if (open) {
        this.resetTransform()
        this.ready = false
        document.addEventListener('keydown', this.onKeydown)
      } else {
        document.removeEventListener('keydown', this.onKeydown)
      }
    },
    imageSrc() {
      this.ready = false
      this.resetTransform()
    },
  },
  mounted() {
    window.addEventListener('mousemove', this.onPointerMove)
    window.addEventListener('mouseup', this.onPointerUp)
    window.addEventListener('touchmove', this.onTouchMove, { passive: false })
    window.addEventListener('touchend', this.onTouchEnd)
  },
  beforeUnmount() {
    window.removeEventListener('mousemove', this.onPointerMove)
    window.removeEventListener('mouseup', this.onPointerUp)
    window.removeEventListener('touchmove', this.onTouchMove)
    window.removeEventListener('touchend', this.onTouchEnd)
    document.removeEventListener('keydown', this.onKeydown)
  },
  methods: {
    onKeydown(event) {
      if (event.key === 'Escape') this.onCancel()
    },
    onImageLoad(event) {
      const img = event.target
      this.naturalW = img.naturalWidth
      this.naturalH = img.naturalHeight
      this.baseScale = Math.max(VIEWPORT / this.naturalW, VIEWPORT / this.naturalH)
      this.ready = true
    },
    resetTransform() {
      this.zoom = 1
      this.panX = 0
      this.panY = 0
      this.rotation = 0
      this.flipX = 1
    },
    rotate(deg) {
      this.rotation = (this.rotation + deg) % 360
    },
    flipHorizontal() {
      this.flipX *= -1
    },
    onPointerDown(event) {
      if (!this.ready) return
      this.dragging = true
      this.dragStartX = event.clientX
      this.dragStartY = event.clientY
      this.panStartX = this.panX
      this.panStartY = this.panY
    },
    onTouchStart(event) {
      if (!this.ready || !event.touches[0]) return
      this.dragging = true
      this.dragStartX = event.touches[0].clientX
      this.dragStartY = event.touches[0].clientY
      this.panStartX = this.panX
      this.panStartY = this.panY
    },
    onPointerMove(event) {
      if (!this.dragging) return
      this.panX = this.panStartX + (event.clientX - this.dragStartX)
      this.panY = this.panStartY + (event.clientY - this.dragStartY)
    },
    onTouchMove(event) {
      if (!this.dragging || !event.touches[0]) return
      event.preventDefault()
      this.panX = this.panStartX + (event.touches[0].clientX - this.dragStartX)
      this.panY = this.panStartY + (event.touches[0].clientY - this.dragStartY)
    },
    onPointerUp() {
      this.dragging = false
    },
    onTouchEnd() {
      this.dragging = false
    },
    onCancel() {
      this.$emit('cancel')
    },
    onApply() {
      const img = this.$refs.imageEl
      if (!img || !this.ready) return

      const dataUrl = this.renderCrop(img)
      if (dataUrl) this.$emit('apply', dataUrl)
    },
    renderCrop(img) {
      const canvas = document.createElement('canvas')
      canvas.width = OUTPUT
      canvas.height = OUTPUT
      const ctx = canvas.getContext('2d')
      if (!ctx) return ''

      const scale = this.baseScale * this.zoom * (OUTPUT / VIEWPORT)

      ctx.fillStyle = '#0f1629'
      ctx.fillRect(0, 0, OUTPUT, OUTPUT)

      ctx.save()
      ctx.translate(OUTPUT / 2 + this.panX * (OUTPUT / VIEWPORT), OUTPUT / 2 + this.panY * (OUTPUT / VIEWPORT))
      ctx.rotate((this.rotation * Math.PI) / 180)
      ctx.scale(scale * this.flipX, scale)
      ctx.drawImage(img, -this.naturalW / 2, -this.naturalH / 2, this.naturalW, this.naturalH)
      ctx.restore()

      return canvas.toDataURL('image/jpeg', 0.9)
    },
  },
}
</script>

<style scoped>
.crop-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(4, 8, 20, 0.82);
  backdrop-filter: blur(10px);
  display: grid;
  place-items: center;
  padding: 20px;
}

.crop-modal {
  width: min(100%, 420px);
  background: #0f1629;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 22px 22px 18px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
}

.crop-header {
  margin-bottom: 16px;
}

.crop-title {
  font-family: 'Unbounded', sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 6px;
}

.crop-sub {
  margin: 0;
  font-size: 13px;
  color: #8891b2;
  line-height: 1.45;
}

.crop-viewport {
  position: relative;
  width: 300px;
  height: 300px;
  margin: 0 auto 18px;
  overflow: hidden;
  border-radius: 50%;
  background: #080c1a;
  cursor: grab;
  touch-action: none;
  user-select: none;
  border: 2px solid rgba(230, 57, 70, 0.35);
  box-shadow: 0 0 0 6px rgba(230, 57, 70, 0.08);
}

.crop-viewport:active {
  cursor: grabbing;
}

.crop-mask {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  pointer-events: none;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
  z-index: 2;
}

.crop-image {
  position: absolute;
  left: 50%;
  top: 50%;
  max-width: none;
  max-height: none;
  transform-origin: center center;
  will-change: transform;
  z-index: 1;
}

.crop-controls {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 18px;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-label {
  font-size: 12px;
  font-weight: 600;
  color: #8891b2;
  min-width: 64px;
}

.control-range {
  flex: 1;
  accent-color: #e63946;
}

.control-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.control-btn {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
  color: #e8eaf2;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: all 0.18s ease;
}

.control-btn:hover {
  background: rgba(230, 57, 70, 0.12);
  border-color: rgba(230, 57, 70, 0.28);
  color: #fff;
}

.crop-footer {
  display: flex;
  gap: 10px;
}

.crop-footer .btn-outline,
.crop-footer .btn-primary {
  flex: 1;
  font-family: 'Onest', sans-serif;
  font-size: 14px;
  font-weight: 600;
  padding: 11px 16px;
  border-radius: 10px;
  cursor: pointer;
  border: none;
}

.btn-outline {
  background: transparent;
  color: #e8eaf2;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.05);
}

.btn-primary {
  background: #e63946;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #c62d39;
}

.btn-primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.crop-fade-enter-active,
.crop-fade-leave-active {
  transition: opacity 0.22s ease;
}

.crop-fade-enter-from,
.crop-fade-leave-to {
  opacity: 0;
}
</style>
