/**
 * Target
 * 
 * Red ball = target1
 * 
 * Blue ball = target2
 */
function HeadForward (speed: number) {
    if (speed >= 0) {
        iBIT.Motor2(ibitMotor.Forward, speed - deltaAngle(currentHeading), speed + deltaAngle(currentHeading))
    } else {
        iBIT.Motor2(ibitMotor.Backward, speed + deltaAngle(currentHeading), speed - deltaAngle(currentHeading))
    }
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
    while (Math.abs(tempD) > angleThreshold) {
        tempD = deltaAngle(currentHeading)
        if (tempD > angleThreshold) {
            iBIT.setMotor(ibitMotorCH.M1, ibitMotor.Backward, 15 + tempD)
            iBIT.setMotor(ibitMotorCH.M2, ibitMotor.Forward, 15 + tempD)
        } else if (tempD < angleThreshold * -1) {
            iBIT.setMotor(ibitMotorCH.M1, ibitMotor.Forward, 15 - tempD)
            iBIT.setMotor(ibitMotorCH.M2, ibitMotor.Backward, 15 - tempD)
        } else {
            iBIT.MotorStop()
        }
        DrawCompass()
    }
}
input.onButtonPressed(Button.A, function () {
    Calibrate()
})
function Grab () {
    huskylens.request()
    if (huskylens.isAppear(currentTarget, HUSKYLENSResultType_t.HUSKYLENSResultBlock)) {
        iBIT.Servo(ibitServo.SV1, 45)
    } else {
        iBIT.Servo(ibitServo.SV1, 0)
    }
}
function DrawCompass () {
    tempDegrees = deltaAngle(currentHeading)
    serial.writeLine("" + (tempDegrees))
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
function Track (rightTurn: boolean) {
    while (!(leftIR() && rightIR())) {
        HeadForward(baseSpeed)
        Grab()
    }
    Release()
    if (rightTurn) {
        DoTurn(90)
    } else {
        DoTurn(-90)
    }
    HeadForward(baseSpeed)
    basic.pause(200)
    if (rightTurn) {
        DoTurn(90)
    } else {
        DoTurn(-90)
    }
    if (currentTarget == 1) {
        currentTarget = 2
    } else {
        currentTarget = 1
    }
}
function Release () {
    HeadForward(baseSpeed)
    basic.pause(200)
    iBIT.MotorStop()
    iBIT.Servo(ibitServo.SV1, 45)
    HeadForward(baseSpeed * -1)
    basic.pause(200)
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
let angleThreshold = 0
let currentTarget = 0
let baseSpeed = 0
let wbThreshold = 0
huskylens.initI2c()
huskylens.initMode(protocolAlgorithm.ALGORITHM_COLOR_RECOGNITION)
wbThreshold = 256
baseSpeed = 30
currentTarget = 1
angleThreshold = 1
calibrated = 0
while (calibrated == 0) {
    basic.showIcon(IconNames.Diamond)
    basic.showIcon(IconNames.SmallDiamond)
}
HeadForward(baseSpeed)
basic.pause(200)
iBIT.MotorStop()
basic.showIcon(IconNames.Happy)
basic.forever(function () {
    DoTurn(0)
})
