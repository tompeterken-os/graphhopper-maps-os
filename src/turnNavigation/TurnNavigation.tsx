import React, {useEffect, useReducer, useState} from 'react'
import {Instruction, Path} from '@/api/graphhopper'
import {metersToText, milliSecondsToText} from '@/Converters'
import {getTurnSign} from '@/sidebar/instructions/Instructions'
import {getCurrentDetails, getCurrentInstruction} from './GeoMethods'
import styles from '@/turnNavigation/TurnNavigation.module.css'
import endNavigation from '@/turnNavigation/end_turn_navigation.png'
import {getLocationStore} from '@/stores/Stores'
import {LocationStoreState} from '@/stores/LocationStore'
import {tr} from '@/translation/Translation'
import {TurnNavigationState} from "@/stores/TurnNavigationStore";

type TurnNavigationProps = {
    path: Path
    location: LocationStoreState
    turnNaviState: TurnNavigationState
}

export default function ({path, location, turnNaviState}: TurnNavigationProps) {
    let currentLocation = location.coordinate
    if (currentLocation.lat == 0 && currentLocation.lng == 0) return <span>Searching GPS...</span>

    const {instructionIndex, timeToNext, distanceToNext, remainingTime, remainingDistance} = getCurrentInstruction(
        path.instructions,
        currentLocation
    )

    let [estimatedAvgSpeed, maxSpeed, surface, roadClass] = getCurrentDetails(path, currentLocation,
        [path.details.average_speed, path.details.max_speed, path.details.surface, path.details.road_class]);

    estimatedAvgSpeed = Math.round(estimatedAvgSpeed)
    console.log('remaining distance: ' + remainingDistance + ', time: ' + remainingTime + ', avg: ' + estimatedAvgSpeed + ", max: " + maxSpeed)

    // TODO too far from route - recalculate?
    if (instructionIndex < 0) return <>Cannot find instruction</>

    const nextInstruction: Instruction = path.instructions[instructionIndex]

    // not sure how to access old state with useState alone
    function reducer(
        state: { distanceToNext: number; index: number; text: string },
        action: { distanceToNext: number; index: number; text: string }
    ) {
        return action
    }

    let [showTime, setShowTime] = useState(true);
    let [showDebug, setShowDebug] = useState(false);
    const [state, dispatch] = useReducer(reducer, {index: -1, distanceToNext: -1, text: ''})

    // speak text out loud after render only if index changed and distance is close next instruction
    useEffect(() => {
        console.log(
            'useEffect',
            state,
            {index: instructionIndex, distanceToNext: distanceToNext},
            nextInstruction.text
        )

        let text = nextInstruction.street_name
        if (turnNaviState.soundEnabled) {
            // making lastAnnounceDistance dependent on location.speed is tricky because then it can change while driving, so pick the constant average speed
            // TODO use instruction average speed of current+next instruction instead of whole path
            let averageSpeed = (path.distance / (path.time / 1000)) * 3.6
            let lastAnnounceDistance = 10 + 2 * Math.round(averageSpeed / 5) * 5

            if (
                distanceToNext <= lastAnnounceDistance &&
                (state.distanceToNext > lastAnnounceDistance || instructionIndex != state.index)
            ) {
                getLocationStore().getSpeechSynthesizer().synthesize(nextInstruction.text)
            }

            let firstAnnounceDistance = 1150
            if (
                averageSpeed > 15 && // two announcements only if faster speed
                distanceToNext > (lastAnnounceDistance + 50) && // do not interfere with last announcement. also "1 km" should stay valid (approximately)
                distanceToNext <= firstAnnounceDistance &&
                (state.distanceToNext > firstAnnounceDistance || instructionIndex != state.index)
            ) {
                let inString = distanceToNext > 800 ? tr('in_km_singular')
                    : tr("in_m", ["" + Math.round(distanceToNext / 100) * 100])
                console.log(inString + ' ' + nextInstruction.text)
                getLocationStore()
                    .getSpeechSynthesizer()
                    .synthesize(inString + ' ' + nextInstruction.text)
            }
        }

        dispatch({index: instructionIndex, distanceToNext: distanceToNext, text: text})
    }, [instructionIndex, distanceToNext])

    const arrivalDate = new Date()
    const currentSpeed = Math.round(location.speed * 3.6)
    arrivalDate.setMilliseconds(arrivalDate.getSeconds() + remainingTime)
    const min = arrivalDate.getMinutes()
    return (
        <>
            <div>
                <div className={styles.turnInfo}>
                    <div className={styles.turnSign}>
                        <div>
                            {getTurnSign(nextInstruction.sign, instructionIndex)}
                        </div>
                        <div>{metersToText(distanceToNext, false)}</div>
                    </div>
                    <div className={styles.turnInfoRightSide}>
                        <div className={styles.arrival}>
                            <div onClick={() => setShowTime(!showTime)}>
                                {showTime
                                    ? <div>{arrivalDate.getHours() + ':' + (min > 9 ? min : '0' + min)}
                                        <svg width="30" height="8">
                                            <circle cx="5" cy="4" r="3"/>
                                            <circle cx="20" cy="4" r="3.5" stroke="black" fill="white"/>
                                        </svg>
                                    </div>
                                    : <div className={styles.arrivalDuration}>{milliSecondsToText(remainingTime)}
                                        <svg width="30" height="8">
                                            <circle cx="5" cy="4" r="3" stroke="black" fill="white"/>
                                            <circle cx="20" cy="4" r="3.5"/>
                                        </svg>
                                    </div>
                                }
                                <div className={styles.remainingDistance}>{metersToText(remainingDistance, false)}</div>
                            </div>
                            <div className={styles.secondCol} onClick={() => setShowDebug(!showDebug)}>
                                <div>{currentSpeed} km/h</div>
                                { maxSpeed != null ? <div className={styles.maxSpeed}>{Math.round(maxSpeed)}</div> : null }
                                { showDebug ?
                                    <div className={styles.debug}>
                                        <div>{estimatedAvgSpeed}</div>
                                        <div>{surface}</div>
                                        <div>{roadClass}</div>
                                    </div>: null
                                }
                            </div>
                            <div className={styles.thirdCol} onClick={() => getLocationStore().stop()}>
                                <img src={endNavigation}/>
                            </div>
                        </div>
                        <div className={styles.turnText}>{state.text}</div>
                    </div>
                </div>
            </div>
        </>
    )
}