import {
	EngineProvider,
	SituationProvider,
} from 'Components/utils/EngineContext'
import {
	configSituationSelector,
	situationSelector,
} from 'Selectors/simulationSelectors'

import useBranchData from 'Components/useBranchData'
import Engine from 'publicodes'
import { useEffect, useMemo } from 'react'
import { Trans } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'

import { constantFolding, getRawNodes } from 'publiopti'
import useRules from './components/useRules'

export default ({ children }) => {
	const { i18n } = useTranslation()
	const currLangAbrv = getCurrentLangAbrv(i18n)
	const branchData = useBranchData()
	const rules = useSelector((state) => state.rules)

	const dispatch = useDispatch()

	const setRules = (rules) => dispatch({ type: 'SET_RULES', rules })

	useEffect(() => {
		if (!branchData.loaded) return
		//This NODE_ENV condition has to be repeated here, for webpack when compiling. It can't interpret shouldUseLocalFiles even if it contains the same variable
		if (NODE_ENV === 'development' && branchData.shouldUseLocalFiles) {
			// TODO: find a way to use compressed models in dev mode
			console.log(
				'===== DEV MODE : the model is on your hard drive on ./nosgestesclimat ======='
			)
			// Rules are stored in nested yaml files
			const req = require.context(
				'../../nosgestesclimat-WC-model/data/',
				true,
				/\.(yaml)$/
			)

			// Bigger rule explanations are stored in nested .md files
			const reqPlus = require.context(
				'raw-loader!../../nosgestesclimat-WC-model/data/actions/plus/',
				true,
				/\.(md)$/
			)

			const plusDottedNames = Object.fromEntries(
				reqPlus
					.keys()
					.map((path) => [
						path.replace(/(\.\/|\.md)/g, ''),
						reqPlus(path).default,
					])
			)

			const rules = req.keys().reduce((memo, key) => {
				const jsonRuleSet = req(key).default || {}
				return { ...memo, ...jsonRuleSet }
			}, {})

			setRules(rules, branchData.deployURL)
		} else {
			const url =
				branchData.deployURL +
				// TODO: find a better way to manage 'en'
				`/co2-${i18n.language === 'en' ? 'en-us' : currLangAbrv}-opti.json`
			console.log('fetching:', url)
			fetch(url, { mode: 'cors' })
				.then((response) => response.json())
				.then((json) => {
					setRules(json, branchData.deployURL)
				})
		}
	}, [
		branchData.deployURL,
		branchData.loaded,
		branchData.shouldUseLocalFiles,
		i18n.language,
	])

	return <EngineWrapper rules={rules}>{children}</EngineWrapper>
}

const EngineWrapper = ({ children }) => {
	const rules = useRules()
	const engineState = useSelector((state) => state.engineState)
	const dispatch = useDispatch()
	const branchData = useBranchData()

	const engineRequested = engineState !== null

	const engine = useMemo(() => {
		const shouldParse = engineRequested && rules
		if (shouldParse) {
			console.log(
				`⚙️ will parse ${Object.keys(rules).length} rules,  expensive operation`
			)
			console.time('⚙️ parsing rules')
			const engine = new Engine(rules)
			console.timeEnd('⚙️ parsing rules')

			if (NODE_ENV === 'development' && branchData.shouldUseLocalFiles) {
				// Optimizing the rules by applying a constant folding optimization pass
				console.time('⚙️ folding rules')
				const foldedRules = constantFolding(engine)
				console.timeEnd('⚙️ folding rules')
				console.time('⚙️ re-parsing rules')
				const sourceFoldedRules = getRawNodes(foldedRules)
				const engineFromFolded = new Engine(sourceFoldedRules)
				console.timeEnd('⚙️ re-parsing rules')
				console.log(
					`⚙️ removed ${
						Object.keys(rules).length -
						Object.keys(engine.getParsedRules()).length
					} rules`
				)
				return engineFromFolded
			}
			return engine
		}
		return false
	}, [engineRequested, branchData.deployURL, rules])

	useEffect(() => {
		if (engine) dispatch({ type: 'SET_ENGINE', to: 'ready' })
		return
	}, [engine])

	const userSituation = useSelector(situationSelector),
		configSituation = useSelector(configSituationSelector),
		situation = useMemo(
			() => ({
				...configSituation,
				...userSituation,
			}),
			[configSituation, userSituation]
		)

	return (
		<EngineProvider value={engine}>
			<SituationProvider situation={situation}>{children}</SituationProvider>
		</EngineProvider>
	)
}

export const WithEngine = ({ children, fallback = null }) => {
	const dispatch = useDispatch()
	const engineState = useSelector((state) => state.engineState)

	useEffect(() => {
		if (!engineState) dispatch({ type: 'SET_ENGINE', to: 'requested' })
		return
	}, [])

	if (engineState !== 'ready') return <div>Chargement du modèle de calcul</div>
	return children
}
