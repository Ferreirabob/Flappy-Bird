function newElement(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barrier(reverse = false) {
    this.element = newElement('div', 'barrier')

    const border = newElement('div', 'border')
    const body = newElement('div', 'body')
    this.element.appendChild(reverse ? body : border)
    this.element.appendChild(reverse ? border : body)

    this.setHeight = height => body.style.height = `${height}px`
}

// const b = new Barrier(true)
// b.setHeight(300)
// document.querySelector('[wm-flappy]').appendChild(b.element)

function pairOfBarrier(height, opening, x) {
    this.element = newElement('div', 'pair-of-barriers')

    this.higher = new Barrier(true)
    this.bottom = new Barrier(false)

    this.element.appendChild(this.higher.element)
    this.element.appendChild(this.bottom.element)

    this.drawOpening = () => {
        const heightHigher = Math.random() * (height - opening)
        const heightBottom = height - opening - heightHigher
        this.higher.setHeight(heightHigher)
        this.bottom.setHeight(heightBottom)
    }

    this.getX = () => parseInt(this.element.style.left.split('px')[0])
    this.setX = x => this.element.style.left = `${x}px`
    this.getWidth = () => this.element.clientWidth

    this.drawOpening()
    this.setX(x)
}

// const b = new pairOfBarrier(700, 200, 800)
// document.querySelector('[wm-flappy]').appendChild(b.element)

function Barriers(height, width, opening, space, notificarPonto) {
    this.pairs = [
        new pairOfBarrier(height, opening, width),
        new pairOfBarrier(height, opening, width + space),
        new pairOfBarrier(height, opening, width + space * 2),
        new pairOfBarrier(height, opening, width + space * 3)
    ]

    const move = 3
    this.animate = () => {
        this.pairs.forEach(par => {
            par.setX(par.getX() - move)

            // When element get off game area
            if (par.getX() < -par.getWidth()) {
                par.setX(par.getX() + space * this.pairs.length)
                par.drawOpening()
            }

            const middle = width / 2
            const crossedMiddle = par.getX() + move >= middle
                && par.getX() < middle
            if(crossedMiddle) notificarPonto()
        })
    }
}


function Bird(heigthGame) {
    let fly = false

    this.element = newElement('img', 'bird')
    this.element.src = 'bird.png'

    this.getY = () => parseInt(this.element.style.bottom.split('px')[0])
    this.setY = y => this.element.style.bottom = `${y}px`

    window.onkeydown = e => fly = true
    window.onkeyup = e => fly = false

    this.animate = () => {
        const newY = this.getY() + (fly ? 8 : -5)
        const heightMaxima = heigthGame - this.element.clientHeight

        if (newY <= 0) {
            this.setY(0)
        } else if (newY >= heightMaxima) {
            this.setY(heightMaxima)
        } else {
            this.setY(newY)
        }
    }

    this.setY(heigthGame / 2)
}

function Progress() {
    this.element = newElement('span', 'progress')
    this.updatePoints = points => {
        this.element.innerHTML = points
    }
    this.updatePoints(0)
}

// const Barriers = new Barriers(700, 1200, 200, 400)
// const bird = new Bird(700)
// const gameArea = document.querySelector('[wm-flappy]')
// gameArea.appendChild(bird.element)
// gameArea.appendChild(new Progress().element)
// Barriers.pairs.forEach(par => gameArea.appendChild(par.element))
// setInterval(() => {
//     Barriers.animate()
//     bird.animate()
// }, 20)

function overlapping(elementA, elementB) {
    const a = elementA.getBoundingClientRect()
    const b = elementB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    return horizontal && vertical
}

function colide(bird, bairrers) {
    let colide = false
    bairrers.pairs.forEach(pairOfBarrier => {
        if (!colide) {
            const higher = pairOfBarrier.higher.element
            const bottom = pairOfBarrier.bottom.element
            colide = overlapping(bird.element, higher)
                || overlapping(bird.element, bottom)
        }
    })
    return colide
}

function FlappyBird() {
    let points = 0

    const gameArea = document.querySelector('[wm-flappy]')
    const height = gameArea.clientHeight
    const width = gameArea.clientWidth

    const progress = new Progress()
    const bairrers = new Barriers(height, width, 200, 400,
        () => progress.updatePoints(++points))
    const bird = new Bird(height)

    gameArea.appendChild(progress.element)
    gameArea.appendChild(bird.element)
    bairrers.pairs.forEach(par => gameArea.appendChild(par.element))

    this.start = () => {
        // Game Loop
        const timer = setInterval(() => {
            bairrers.animate()
            bird.animate()

            if (colide(bird, bairrers)) {
                clearInterval(timer)
            }
        }, 20)
    }
}

new FlappyBird().start()
