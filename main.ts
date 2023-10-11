function HeadForward () {
    iBIT.Motor2(ibitMotor.Forward, 50 - deltaAngle(currentHeading), 50 + deltaAngle(currentHeading))
    DrawCompass()
}
function DoTurn (turnAngle: number) {
    tempD = (currentHeading + turnAngle) % 360
    if (tempD < 0) {
        currentHeading = tempD + 360
    } else {
        currentHeading = tempD
    }
    tempD = deltaAngle(currentHeading)
    while (Math.abs(tempD) > 2) {
        tempD = deltaAngle(currentHeading)
        if (tempD > 0) {
            iBIT.setMotor(ibitMotorCH.M1, ibitMotor.Backward, 30 + tempD)
            iBIT.setMotor(ibitMotorCH.M2, ibitMotor.Forward, 30 + tempD)
        } else {
            iBIT.setMotor(ibitMotorCH.M1, ibitMotor.Forward, 30 - tempD)
            iBIT.setMotor(ibitMotorCH.M2, ibitMotor.Backward, 30 - tempD)
        }
        DrawCompass()
    }
}
input.onButtonPressed(Button.A, function () {
    Calibrate()
})
function DrawCompass () {
    tempDegrees = deltaAngle(currentHeading)
    serial.writeLine("" + (tempDegrees))
    if (tempDegrees < -135) {
        basic.showArrow(ArrowNames.South)
    } else if (tempDegrees < -45) {
        basic.showArrow(ArrowNames.East)
    } else if (tempDegrees < 45) {
        basic.showArrow(ArrowNames.North)
    } else if (tempDegrees < 135) {
        basic.showArrow(ArrowNames.West)
    } else {
        basic.showArrow(ArrowNames.South)
    }
}
function rightIR () {
    return iBIT.ReadADC(ibitReadADC.ADC0) < wbThreshold
}
function Calibrate () {
    while (!(leftIR() && rightIR())) {
        if (leftIR()) {
            iBIT.Spin(ibitSpin.Right, 25)
        } else if (rightIR()) {
            iBIT.Spin(ibitSpin.Left, 25)
        } else {
            iBIT.Motor(ibitMotor.Forward, 25)
        }
    }
    currentHeading = input.compassHeading()
    calibrated = 1
}
input.onButtonPressed(Button.AB, function () {
    input.calibrateCompass()
})
function Track () {
    while (!(leftIR() && rightIR())) {
        HeadForward()
    }
    iBIT.MotorStop()
}
// returns angle (-180,180) positive being cw error
// negative being ccw error
function deltaAngle (targetAngle: number) {
    return (input.compassHeading() - targetAngle + 180) % 360 - 180
}
function leftIR () {
    return iBIT.ReadADC(ibitReadADC.ADC1) < wbThreshold
}
let tempDegrees = 0
let tempD = 0
let currentHeading = 0
let calibrated = 0
let wbThreshold = 0
huskylens.initI2c()
huskylens.initMode(protocolAlgorithm.OBJECTCLASSIFICATION)
wbThreshold = 256
calibrated = 0
HeadForward()
basic.pause(200)
iBIT.MotorStop()
basic.showIcon(IconNames.Yes)
basic.pause(100)
basic.clearScreen()
basic.forever(function () {
    DrawCompass()
})
