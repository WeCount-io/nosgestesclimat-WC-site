import { useState } from 'react'
import styled from 'styled-components'

import Chart from './content/Chart'
import DurationChart from './content/DurationChart'
import DurationFigures from './content/DurationFigures'
import Evolution from './content/Evolution'
import IframeFigures from './content/IframeFigures'
import KmFigures from './content/KmFigures'
import ScoreFromURL from './content/ScoreFromURL'
// import Loader from './applications/Loader'

const Wrapper = styled.div`
	display: flex;
	width: 100%;
	margin-bottom: 2rem;

	@media screen and (max-width: ${1200}px) {
		flex-direction: column;
	}
`
export default function Data(props) {
	const { data: total } = useTotal()
	const { data: simulations } = useSimulationsTerminees()
	const { data: duration } = useVisitsDuration()
	const { data: avgduration } = useVisitsAvgDuration()
	// const { data: avgsimulation } = useSimulationAvgDuration() -> not used anymore
	const { data: websites } = useWebsites()
	const { data: oldWebsites } = useOldWebsites()
	const { data: socials } = useSocials()
	const { data: keywords } = useKeywords()
	const { data: period } = usePeriod()
	const { data: reference } = useReference()
	const { data: entryPages } = useEntryPages()
	const { data: activeEntryPages } = useActiveEntryPages()
	const { data: pages } = usePages()
	const { data: allTime } = useAllTime()
	const { data: kmhelp } = useKmHelp()
	const { data: simulationsfromhelp } = useSimulationsfromKmHelp()
	const { data: ridesnumber } = useRidesNumber()

	return (
		<div>
			<Section.TopTitle>
				<Trans>Statistiques</Trans>
			</Section.TopTitle>
			<Section>
				<Section.Title>
					<Trans>Stats générales</Trans>
				</Section.Title>
				<UseQueryResultHandler
					requestResults={[period, reference, allTime, simulations]}
					toRenderWithRequestData={([
						periodData,
						referenceData,
						allTimeData,
						simulationsData,
					]) => (
						<Wrapper>
							<Evolution
								period={periodData.value}
								reference={referenceData.value}
								allTime={allTimeData.value}
								simulations={simulationsData}
							/>
							<Chart />
						</Wrapper>
					)}
				/>
				<UseQueryResultHandler
					requestResults={[total, websites, oldWebsites, socials, keywords]}
					toRenderWithRequestData={([
						totalData,
						websitesData,
						oldWebsitesData,
						socialsData,
						keywordsData,
					]) => (
						<Sources
							total={totalData.value}
							websites={websitesData}
							oldWebsites={oldWebsitesData}
							socials={socialsData}
							keywords={keywordsData}
						/>
					</Section>
					<Section>
						<Section.Title>Intégrations et Iframes</Section.Title>
						<Section.Intro>
							<summary>En savoir plus</summary>
							<p>
								Les intégrations en iframe sont détéctées via le paramètre
								'iframe' dans l'URL, ceci seulement si l'intégrateur a utilisé
								le&nbsp;<a href="./diffuser">script dédié</a>. Ainsi, les
								visites via les iframes d'intégrateurs qui n'ont pas utilisé ce
								script sont dispersées dans les visites générales de Nos Gestes
								Climat. Dans l'attente de chiffres plus précis, ce taux est donc
								potentiellement sous-estimé par rapport à la réalité.
								<i>(Données valables pour les 30 derniers jours)</i>
							</p>
						</Section.Intro>
						<Wrapper>
							<IframeFigures
								pages={entryPagesData}
								activePages={activeEntryPagesData}
							/>
						</Wrapper>
					</Section>
					<Section>
						<Section.Title>Durée des visites</Section.Title>
						<Section.Intro>
							<summary>En savoir plus</summary>
							<p>
								Cette section est générée à partir des visites des 60 derniers
								jours. Les visites dont le temps passé sur le site est inférieur
								à 1 minute ont été écartées. Pour éviter le biais de l'iframe
								qui peut générer des visiteurs inactifs dans les statistiques,
								le temps moyen sur le site a été calculé à partir des visites
								actives (l'utilisateur a cliqué sur "Faire le test").
							</p>
						</Section.Intro>
						<Wrapper>
							<DurationFigures avgduration={avgdurationData} />
							{duration.isSuccess && <DurationChart duration={duration.data} />}
						</Wrapper>
					</Section>
					<Section>
						<Section.Title>Score de nos utilisateurs</Section.Title>
						<Section.Intro>
							<summary>En savoir plus</summary>
							<p>
								Bien sûr, nous ne collectons pas{' '}
								<a href="/vie-priv%C3%A9e">les données utlisateurs</a>.
								Néanmoins, le score total ainsi que l'empreinte par catégorie
								est présente dans l'URL de fin de test. Dans cette section, nous
								agrégeons cees informations pour avoir une idée de l'empreinte
								carbone moyenne de nos utilisateurs et de distribution du score
								afin d'analyser ces résultats dans le contexte des évolutions du
								modèle.
							</p>{' '}
							<p>
								L'objectif ici n'est pas d'évaluer l'empreinte carbone des
								Français : à priori, les utilisateurs du tests de sont pas
								représentatifs des Français. De plus, ces données peuvent être
								biaisées par des utilisateurs qui reviendraient à plusieurs
								reprises sur la page de fin, en changeant ses réponses au test
								(ce qui crée de nouveaux url de fin).
							</p>
						</Section.Intro>
						<Wrapper>
							<ScoreFromURL pages={pagesData} />
						</Wrapper>
					</Section>
					<Section>
						<Section.Title>La voiture en chiffres</Section.Title>
						<KmFigures
							kmhelp={kmhelpData}
							simulationsfromhelp={simulationsfromhelpData?.nb_visits}
							ridesnumber={ridesnumberData?.nb_events}
						/>
					</Section>
				</>
			) : (
				<div>Chargement</div>
				//TODO: what should we do here?
				// <Loader />
			)}
		</div>
	)
}
