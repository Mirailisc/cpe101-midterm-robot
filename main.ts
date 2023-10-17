// Target
// 
// Red ball = target1
// 
// Blue ball = target2
function HeadForward (speed: number, duration: number) {
    tempV = Math.max(Math.min(deltaAngle() * 1, 30), -30)
    if (duration <= 1) {
        if (speed >= 0) {
            iBIT.Motor2(ibitMotor.Forward, speed - tempV, speed + tempV)
        } else {
            iBIT.Motor2(ibitMotor.Backward, Math.abs(speed) + tempV, Math.abs(speed) - tempV)
        }
        Log()
    } else {
        tempT = input.runningTime()
        while (input.runningTime() - tempT < duration) {
            tempV = Math.max(Math.min(deltaAngle() * 1, 30), -30)
            if (speed >= 0) {
                iBIT.Motor2(ibitMotor.Forward, speed - tempV, speed + tempV)
            } else {
                iBIT.Motor2(ibitMotor.Backward, Math.abs(speed) + tempV, Math.abs(speed) - tempV)
            }
            Log()
        }
    }
}
function DoTurn (turnAngle: number) {
    currentHeading = (currentHeading + turnAngle) % 360
    tempD = deltaAngle()
    while (Math.abs(tempD) > angleThreshold) {
        tempD = deltaAngle()
        tempV = Math.min(Math.max(0 + Math.abs(tempD), minimumTurnSpeed), maximumTurnSpeed)
        if (tempD > angleThreshold) {
            iBIT.setMotor(ibitMotorCH.M1, ibitMotor.Backward, tempV)
            iBIT.setMotor(ibitMotorCH.M2, ibitMotor.Forward, tempV)
        } else {
            iBIT.setMotor(ibitMotorCH.M1, ibitMotor.Forward, tempV)
            iBIT.setMotor(ibitMotorCH.M2, ibitMotor.Backward, tempV)
        }
        Log()
    }
    iBIT.MotorStop()
}
function MainLoop () {
    Track(true, false)
    Track(false, true)
    Track(true, true)
    Track(false, true)
    Track(true, false)
}
function Test2 () {
    HeadForward(baseSpeed, 1)
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
function rightIR () {
    return iBIT.ReadADC(ibitReadADC.ADC0) < wbThreshold
}
function Test3 () {
    HeadForward(baseSpeed, 2000)
    DoTurn(90)
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
    while (leftIR() && rightIR()) {
        iBIT.Motor(ibitMotor.Forward, baseSpeed)
    }
    basic.pause(500)
}
input.onButtonPressed(Button.AB, function () {
    input.calibrateCompass()
})
function Track (rightTurn: boolean, intersect: boolean) {
    while (!(leftIR() && rightIR())) {
        HeadForward(baseSpeed, 0)
        Grab()
    }
    if (intersect) {
        HeadForward(baseSpeed, 200)
        while (!(leftIR() && rightIR())) {
            HeadForward(baseSpeed, 0)
            Grab()
        }
    }
    HeadForward(-20, 500)
    Calibrate()
    Release()
    if (rightTurn) {
        DoTurn(90)
    } else {
        DoTurn(-90)
    }
    HeadForward(baseSpeed, 500)
    if (rightTurn) {
        DoTurn(90)
    } else {
        DoTurn(-90)
    }
    Calibrate()
    if (currentTarget == 1) {
        currentTarget = 2
    } else {
        currentTarget = 1
    }
}
input.onButtonPressed(Button.B, function () {
    DoTurn(90)
})
function Log () {
    tempDegrees = deltaAngle()
    radio.sendValue("dAng", tempDegrees)
}
function Release () {
    HeadForward(baseSpeed, 1500)
    iBIT.MotorStop()
    iBIT.Servo(ibitServo.SV1, 45)
    HeadForward(baseSpeed * -1, 1000)
}
function Test1 () {
    DoTurn(0)
}
// returns angle (-180,180) positive being cw error
// negative being ccw error
function deltaAngle () {
    return (input.compassHeading() - currentHeading + 180) % 360 - 180
}
function leftIR () {
    return iBIT.ReadADC(ibitReadADC.ADC1) < wbThreshold
}
let tempDegrees = 0
let tempD = 0
let currentHeading = 0
let tempT = 0
let tempV = 0
let calibrated = 0
let maximumTurnSpeed = 0
let minimumTurnSpeed = 0
let angleThreshold = 0
let currentTarget = 0
let baseSpeed = 0
let wbThreshold = 0
radio.setGroup(69)
huskylens.initI2c()
huskylens.initMode(protocolAlgorithm.ALGORITHM_COLOR_RECOGNITION)
wbThreshold = 256
baseSpeed = 30
currentTarget = 1
angleThreshold = 3
minimumTurnSpeed = 5
maximumTurnSpeed = 30
calibrated = 0
while (calibrated == 0) {
    basic.showIcon(IconNames.Diamond)
    basic.showIcon(IconNames.SmallDiamond)
}
basic.showIcon(IconNames.Happy)
basic.forever(function () {
    MainLoop()
})
