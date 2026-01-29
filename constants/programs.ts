export const PROGRAMS = [
    {
        id: 'arm-pump',
        title: 'Arm Pump Extremo',
        image: require('../assets/programs/arm_pump.png'),
        downloads: '10.2k',
        rating: '5.0',
        tag: 'Braços',
        isBookmarked: false,
        overlayTitle: '',
        days: [
            { name: 'Full Arm Pump', exerciseIds: ['6', '107', '134', '1511', '122', '29'] }
        ]
    },
    {
        id: 'full-body-1h',
        title: 'Full Body Mastery (1h+)',
        image: require('../assets/programs/full_body_1h.png'),
        downloads: '5.4k',
        rating: '4.9',
        tag: 'Corpo Todo',
        badge: '1h+',
        isBookmarked: true,
        overlayTitle: '',
        days: [
            { name: 'Full Body A', exerciseIds: ['18', '2', '4', '176', '107', '122', '212', '222', '182', '1725'] }
        ]
    },
    {
        id: '2',
        title: "Strive's 4-Day Bodybuilding split",
        image: require('../assets/programs/four_day_split.png'),
        downloads: '94.060',
        rating: '4.4',
        tag: '4 Dias',
        isBookmarked: true,
        overlayTitle: '',
        days: [
            { name: 'Dia 1: Peito & Bíceps', exerciseIds: ['2', '136', '1765', '275', '6', '134', '115', '122'] },
            { name: 'Dia 2: Costas & Tríceps', exerciseIds: ['105', '58', '86', '177', '229', '107', '1511', '84'] },
            { name: 'Dia 3: Pernas & Panturrilhas', exerciseIds: ['18', '212', '222', '213', '7', '36', '182', '218'] },
            { name: 'Dia 4: Ombros & Abs', exerciseIds: ['176', '145', '2593', '3726', '74', '1725', '1598', '1455'] }
        ]
    },
    {
        id: '5',
        title: '5-Day Split Plan',
        image: require('../assets/programs/five_day_split.png'),
        downloads: '15.390',
        rating: '4.3',
        tag: '5 Dias',
        isBookmarked: true,
        overlayTitle: '',
        days: [
            { name: 'Dia 1: Peito', exerciseIds: ['2', '136', '1765', '117', '275', '204', '132'] },
            { name: 'Dia 2: Costas', exerciseIds: ['105', '58', '86', '76', '4', '120', '177', '229'] },
            { name: 'Dia 3: Pernas', exerciseIds: ['18', '212', '222', '213', '7', '36', '182', '218'] },
            { name: 'Dia 4: Ombros', exerciseIds: ['176', '145', '2593', '3726', '74', '1598', '4970'] },
            { name: 'Dia 5: Braços & Abs', exerciseIds: ['6', '107', '1768', '134', '1511', '122', '84', '1725'] }
        ]
    },
    {
        id: '1',
        title: 'Full Body Workout',
        image: require('../assets/programs/full_body.png'),
        downloads: '88.452',
        rating: '4.3',
        tag: null,
        isBookmarked: false,
        overlayTitle: '',
        days: [
            { name: 'Full Body', exerciseIds: ['18', '2', '4', '176', '107', '6', '1725'] }
        ]
    },
    {
        id: '4',
        title: 'JEFF NIPPARD - Hypertrophy',
        image: require('../assets/programs/jeff_nippard.png'),
        downloads: '12.756',
        rating: '4.6',
        badge: 'Top Picks',
        isBookmarked: true,
        overlayTitle: '',
        days: [
            { name: 'Hypertrophy A', exerciseIds: ['18', '6', '212', '105', '7', '2', '1725'] }
        ]
    }
];
