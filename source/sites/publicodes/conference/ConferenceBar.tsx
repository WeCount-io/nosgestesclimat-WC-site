import { correctValue } from 'Components/publicodesUtils'
import { useEngine } from 'Components/utils/EngineContext'
import { usePersistingState } from 'Components/utils/persistState'
import { useEffect, useState } from 'react'
import emoji from 'react-easy-emoji'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { situationSelector } from 'Selectors/simulationSelectors'
import { WebrtcProvider } from 'y-webrtc'
import * as Y from 'yjs'
import { useSimulationProgress } from '../../../components/utils/useNextQuestion'
import { extractCategories } from 'Components/publicodesUtils'
import { computeHumanMean } from './Stats'
import { filterExtremes } from './utils'
import { backgroundConferenceAnimation } from './conferenceStyle'
import { WebsocketProvider } from 'y-websocket'
import useYjs from './useYjs'
import { minimalCategoryData } from '../../../components/publicodesUtils'

export default () => {
	const situation = useSelector(situationSelector),
		engine = useEngine(),
		evaluation = engine.evaluate('bilan'),
		{ nodeValue: rawNodeValue, dottedName, unit, rawNode } = evaluation
	const rules = useSelector((state) => state.rules)

	const progress = useSimulationProgress()
	const { elements, users, username, conference } = useYjs(null)

	const byCategory = minimalCategoryData(extractCategories(rules, engine))

	const nodeValue = correctValue({ nodeValue: rawNodeValue, unit })

	useEffect(() => {
		if (!conference?.ydoc) return null

		const simulations = conference.ydoc.get('simulations', Y.Map)

		simulations.set(username, {
			total: Math.round(nodeValue),
			progress,
			byCategory,
		})
	}, [situation])

	if (!conference?.ydoc)
		return <Link to="/conférence">Lancer une conférence</Link>

	const simulationArray = elements && Object.values(elements),
		result = computeHumanMean(simulationArray.map((el) => el.bilan))

	return (
		<Link to={'/conférence/' + conference.room} css="text-decoration: none;">
			<div
				css={`
					@keyframes gradient {
						0% {
							background-position: 0% 50%;
						}
						50% {
							background-position: 100% 50%;
						}
						100% {
							background-position: 0% 50%;
						}
					}
					background: linear-gradient(
						90deg,
						white -10%,
						var(--color) 10%,
						#6AD7CA 90%,
						white 110%
					);
					background-size: 400% 400%;
					animation: gradient 15s ease infinite;
					color: white;
					padding: 0.3rem 1rem;
					display: flex;
					justify-content: space-evenly;
					align-items: center;
					> span {
						display: flex;
						align-items: center;
					}
					img {
						font-size: 150%;
						margin-right: 0.4rem !important;
					}
					@media (min-width: 800px) {
						flex-direction: column;
						align-items: start;
						> * {
							margin: 0.3rem 0;
						}
					}
				`}
			>
				<span css="text-transform: uppercase">
					«&nbsp;{conference.room}&nbsp;»
				</span>
				<span>
					{emoji('🧮')} {result}
				</span>
				<span>
					{emoji('👥')}{' '}
					<span
						css={`
							background: #78b159;
							width: 1.5rem;
							height: 1.5rem;
							border-radius: 2rem;
							display: inline-block;
							line-height: 1.5rem;
							text-align: center;
						`}
					>
						{users.length}
					</span>
				</span>
			</div>
		</Link>
	)
}
