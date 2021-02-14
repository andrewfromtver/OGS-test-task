require('babel-core/register')
require('babel-polyfill')

global.THREE = require('./js/three')

import background from './assets/bg.png'
import slotsImg from './assets/slots.png'
import './style.css'

class SlotMachine {
    constructor(background, slotsImg, slotsQty, spinable = true) {
        this.background = background
        this.slotsImg = slotsImg
        this.slotsQty = slotsQty
        this.spinable = spinable
    }
    machineButtons() {
        const buttons = document.createElement('div')
        this.startBtn = document.createElement('button')
        this.startBtn.innerText = 'Start'
        this.startBtn.onclick = () => {
            for (let i = 0; i <= 900 ; i += 90) {
                setTimeout(() => { this.spin() }, i)
            }
        }
        buttons.appendChild(this.startBtn)
    
        this.stopBtn = document.createElement('button')
        this.stopBtn.innerText = 'Stop'
        this.stopBtn.onclick = () => {
            this.stopSpin()
        }
        buttons.appendChild(this.stopBtn)
    
        document.body.appendChild(buttons)
    }

    randomInt(min = 64,max = 512) {
        let v  = Math.round(min + Math.random() * (max - min))

        return v % 64 == 0?v:this.randomInt(min,max)
    }

    createSlotElementMaterial() {
        THREE.ImageUtils.crossOrigin = ''
        let t = THREE.ImageUtils.loadTexture(this.background)
        t.wrapS = THREE.RepeatWrapping
        t.wrapT = THREE.RepeatWrapping
        let m = new THREE.MeshBasicMaterial()
        m.map = t
        
        return m
    }

    bigWin() {
        let slotsPosition = []
        this.meshes.forEach(e => {
            if (String(e.rotation.x / 0.62832).split('.')[1][1] == 9) {
                slotsPosition.push(String(e.rotation.x / 0.62832).split('.')[0])
            }
            else {
                slotsPosition.push(String(e.rotation.x / 0.62832 - 1).split('.')[0])
            }
        })
        if (slotsPosition.every(e => e % 5 === 0)) {
            return true
        }
        else {
            return false
        }
    }

    init() {
        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(100, 640/400, 0.1, 1000)
        this.renderer = new THREE.WebGLRenderer()
        this.renderer.setSize(640, 400)
        document.body.appendChild(this.renderer.domElement)
        //slot machine elements
        this.geometry = new THREE.CylinderGeometry(20, 20, 20, 20)
        this.material = this.createSlotElementMaterial()
        this.meshes = []
        for(let i=0; i< this.slotsQty ; i++) {
            this.meshes[i] = new THREE.Mesh(this.geometry, this.material)
            this.meshes[i].name = 'slot_'+i
            this.meshes[i].position.x = ((20)*i) - 42.5
            this.meshes[i].rotation.z = Math.PI/2
            this.meshes[i].rotation.x = 0.62832
            this.scene.add(this.meshes[i])
        }
        //slot machine body
        this.bodyGeometry = new THREE.BoxGeometry(193, 85, 22)
        this.bodyTexture = THREE.ImageUtils.loadTexture(this.slotsImg)
        this.bodyTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()
        this.bodyMaterial = new THREE.MeshBasicMaterial({map: this.bodyTexture})
        this.bodyMesh = new THREE.Mesh(this.bodyGeometry, this.bodyMaterial)
        this.bodyMesh.position.x = 0
        this.bodyMesh.position.y = 0
        this.bodyMesh.position.z = 5
        this.scene.add(this.bodyMesh)
        this.spin(64)
        this.machineButtons()
        //camera
        this.camera.position.z = 80
    }

    async spin(spins = this.randomInt()){
        this.meshes.forEach(e => {
            e.rotation.x = 0.62832 * ((this.randomInt() + 1) / 16) + 0.62832
        })
        this.spinable = true
        const animate = () => {
            requestAnimationFrame(animate)
            spins -= 1
            if(spins < 0) {
                if (this.startBtn && this.stopBtn) {
                    this.startBtn.disabled = false
                    this.stopBtn.disabled = true
                }
                return }
            for(let i = 0; i < this.slotsQty ; i++) {
                if (this.spinable) {
                    this.meshes[i].rotation.x += 0.62832 * ((i + 1) / 32)
                }
                if (this.startBtn && this.stopBtn) {
                    this.startBtn.disabled = true
                    this.stopBtn.disabled = false
                }
            }
            this.renderer.render(this.scene, this.camera)
        }
        animate()
    }

    async stopSpin() {
        this.spinable = false
        this.meshes.forEach(e => {
            e.rotation.x = 0.62832 * ((this.randomInt() + 1) / 16) + 0.62832
        })
        this.renderer.render(this.scene, this.camera)
    }
}

window.onload = function () {
    let game = new SlotMachine(slotsImg, background, 5)
    game.init()

    function winListener() {
        if (game.bigWin()) {
            alert('Big win !')
            game.stopSpin()
        }
    }
    const elem = document.querySelector('body')
    elem.addEventListener('click', winListener)
}