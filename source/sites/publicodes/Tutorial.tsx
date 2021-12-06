import AbacusFrance from 'Images/abacus-france.svg'
import CO2e from 'Images/co2e.svg'
import ObjectifClimat from 'Images/objectif-climat.svg'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { skipTutorial } from '../../actions/actions'
import emoji from '../../components/emoji'
import CarbonImpact from './CarbonImpact'
import Chart from './chart/index.js'
import HorizontalSwipe from './HorizontalSwipe'
import Slide from './TutorialSlide'
import GreenhouseEffect from 'Images/greenhouse-effect.svg'
import { Redirect } from 'react-router'
import { useContext } from 'react'
import { TrackerContext } from '../../components/utils/withTracker'

export default ({}) => {
	const tutorials = useSelector((state) => state.tutorials)

	if (tutorials['testIntro']) return <Redirect to={'/simulateur/bilan'} />

	const tutos = Object.entries(tutorials)
		.map(([k, v]) => v != null && k.split('testIntro')[1])
		.filter(Boolean)

	const index = tutos.length

	const Component = slides[index]

	const dispatch = useDispatch()
	const tracker = useContext(TrackerContext)

	const skip = (name, unskip) => dispatch(skipTutorial(name, unskip)),
		last = index === slides.length - 1,
		next = () => {
			tracker.push([
				'trackEvent',
				'testIntro',
				last ? `tuto passé` : `diapo ${index} passée`,
			])

			skip(last ? 'testIntro' : 'testIntro' + index)
		},
		previous = () => dispatch(skipTutorial('testIntro' + (index - 1), true))

	return (
		<div
			css={`
				height: 70vh;
				@media (max-width: 800px) {
					height: 95vh;
				}
				@media (min-aspect-ratio: 1280/700) {
					height: 95vh;
				}
				position: relative;
				display: flex;
				justify-content: center;
				align-items: center;
			`}
		>
			<HorizontalSwipe {...{ next, previous }}>
				<Slide
					{...{
						last,
						skip,
					}}
				>
					<Component />
				</Slide>
			</HorizontalSwipe>
		</div>
	)
}

const slides = [
	() => (
		<>
			<h1>Mon empreinte climat {emoji('😶‍🌫️')} ?</h1>
			<p>Pas de panique, on vous explique ce que c'est.</p>
			<p>
				La planète <strong>se réchauffe dangereusement</strong>, au fur et à
				mesure des gaz à effet de serre que l'on émet.
			</p>
			<GreenhouseEffect css="max-height: 30vh" />
			<p>
				Ce test vous donne en {emoji('⏱️')} 10 minutes chrono{' '}
				<strong>une mesure de votre part </strong> dans ce réchauffement.
			</p>
		</>
	),
	() => (
		<>
			<h1>On la mesure comment ?</h1>
			<p>
				Avec une unité au nom barbare : l'équivalent CO₂. Le dioxyde de carbone
				<img
					src="/images/co2.svg"
					css={`
						object-fit: cover;
						vertical-align: middle;
						width: 3.5rem;
						height: 1.7rem;
					`}
				/>
				, vous le connaissez : on l'expire toute la journée, mais sans influence
				sur le climat.
			</p>
			<div
				css={`
					svg {
						height: 7rem;
						margin: 0.6rem auto;
						display: block;
						animation: fall 0.5s ease-in;
					}

					@keyframes fall {
						from {
							transform: translateY(-100%);
							opacity: 0;
						}
						80% {
							transform: translateY(10%);
							opacity: 1;
						}
						100% {
							transform: translateY(0%);
							opacity: 1;
						}
					}

					svg text {
						mask-size: 200%;

						mask-image: linear-gradient(
							-75deg,
							rgba(0, 0, 0, 0.6) 30%,
							#000 50%,
							rgba(0, 0, 0, 0.6) 70%
						);
						mask-size: 200%;
						animation: shine 2s linear infinite;

						@keyframes shine {
							from {
								-webkit-mask-position: 150%;
							}
							to {
								-webkit-mask-position: -50%;
							}
						}
					}
				`}
			>
				<CO2e />
			</div>
			<p>
				Ce sont les machines qui font notre confort moderne qui en rejettent
				massivement, à tel point qu'on le compte en milliers de kilos par an et
				par personne, donc en <strong>tonnes</strong> de CO₂e !
			</p>
			<blockquote>
				<details>
					<summary>
						{emoji('💡')}&nbsp; Mais que veut dire ce petit <em>e</em> ?
					</summary>{' '}
					D'autres gaz, surtout le méthane&nbsp;
					<img
						src="/images/methane.svg"
						css="width: 1.8rem; vertical-align: middle; object-fit: cover; height: 1.7rem"
					/>{' '}
					et le protoxyde d'azote{' '}
					<img
						src="/images/n2o.svg"
						css="width: 3rem; vertical-align: middle; object-fit: cover; height: 1.7rem"
					/>{' '}
					réchauffent aussi la planète : on convertit leur potentiel de
					réchauffement en équivalent CO₂ pour simplifier la mesure.{' '}
				</details>
			</blockquote>
		</>
	),
	() => (
		<>
			<h1>Et concrètement ?</h1>
			<p>
				Chaque année, un français émet en moyenne{' '}
				<strong> à peu près 10 tonnes</strong> de CO₂e.
			</p>
			<AbacusFrance css="width:10rem; height: 100%" />
			<p>
				C'est votre point de départ dans ce test : chaque réponse que vous
				donnerez va personnaliser ce résultat dans la barre de résultat.
			</p>
			<div css="margin: 1rem 0">
				<CarbonImpact demoMode />
			</div>
		</>
	),
	() => (
		<>
			<h1>Et l'objectif ?</h1>
			<p>Nous devons diminuer notre empreinte climat au plus vite.</p>
			<p>
				En France, ça consiste à passer de ~10 tonnes à{' '}
				<strong>moins de 2 tonnes</strong> par an.
			</p>

			<ObjectifClimat
				css={`
					width: 16rem;
					g path:first-child {
						stroke-dasharray: 1000;
						stroke-dashoffset: 1000;
						animation: dash 5s ease-in forwards;
						animation-delay: 1s;
					}

					@keyframes dash {
						to {
							stroke-dashoffset: 0;
						}
					}
					g path:nth-child(2) {
						animation: objective-line-appear 2s ease-in;
					}
					@keyframes objective-line-appear {
						from {
							opacity: 0;
						}
						30% {
							opacity: 0;
						}
						100% {
							opacity: 1;
						}
					}
					path[fill='#532fc5'] {
						fill: var(--color);
					}
				`}
			/>
			<p css="text-align: center; line-height: 1.2rem">
				<em>
					Pour en savoir plus, tout est expliqué <br />
					dans{' '}
					<a href="https://datagir.ademe.fr/blog/budget-empreinte-carbone-c-est-quoi/">
						cet article
					</a>{' '}
					(15 min de lecture)
				</em>
				.
			</p>
		</>
	),
	() => (
		<>
			<h1>D'où vient notre empreinte ?</h1>
			<p>
				Prendre la voiture, manger un steak, chauffer sa maison, se faire
				soigner, acheter une TV...
			</p>
			<div
				css={`
					margin: 0.6rem 0 1rem;
				`}
			>
				<Chart />
			</div>
			<p>
				L'empreinte de notre consommation individuelle, c'est la somme de toutes
				ces activités qui font notre vie moderne.{' '}
			</p>
		</>
	),
	() => (
		<>
			<h1>Alors, c'est parti ?</h1>
			<p>Quelques astuces pour vous aider à compléter le test.</p>
			<blockquote>
				{emoji('👤')}&nbsp; Répondez aux questions en votre nom, pas au nom de
				votre foyer : c'est un test individuel.
			</blockquote>
			<blockquote>
				{emoji('💼')}&nbsp; Répondez pour votre vie perso, pas pour votre boulot
				ou études. <em>Une seule exception </em>: votre trajet domicile-travail
				doit être inclus dans les km parcourus.
			</blockquote>
			<blockquote>
				{emoji('❓️')}&nbsp; D'autres questions ? Consultez notre{' '}
				<Link to="/contribuer">FAQ</Link> à tout moment.
			</blockquote>
		</>
	),
]
