import { Box, Typography, Button } from "@mui/material";
import { ModScreenFC, Realm, EnemyEntity, GameEvent } from "afnm-types";

export const ArenaScreen: ModScreenFC = ({ screenAPI }) => {
    const BackgroundImage = screenAPI.components.BackgroundImage
    const GameDialog = screenAPI.components.GameDialog
    const PlayerComponent = screenAPI.components.PlayerComponent

    console.log("Rendering ArenaScreen");
    console.log("ScreenAPI", screenAPI)

    const locationName = screenAPI.useSelector(state => state.location.current)
    const location = window.modAPI.gameData.locations[locationName]

    console.log("Location:", location)

    const player = screenAPI.useSelector(state => state.player.player)
    const playerState = screenAPI.useSelector(state => state.player)

    console.log("Player:", player)
    console.log("Player State:", playerState)

    // Define realm progression order
    const realmProgression: Realm[] = [
        'mundane',
        'bodyForging', 
        'meridianOpening',
        'qiCondensation',
        'coreFormation',
        'pillarCreation'
    ];

    const realmDisplayNames: Partial<Record<Realm, string>> = {
        'mundane': 'Mundane',
        'bodyForging': 'Body Forging',
        'meridianOpening': 'Meridian Opening', 
        'qiCondensation': 'Qi Condensation',
        'coreFormation': 'Core Formation',
        'pillarCreation': 'Pillar Creation'
    };

    const getPromotionEnemies = (realm: Realm): EnemyEntity[] => {
        const earlyLocations = Object.values(window.modAPI.gameData.locations).filter(
            (e) => e.realm === realm && e.realmProgress === 'Early' && e.enemies,
        );
        const middleLocations = Object.values(
            window.modAPI.gameData.locations,
        ).filter(
            (e) => e.realm === realm && e.realmProgress === 'Middle' && e.enemies,
        );
        const lateLocations = Object.values(window.modAPI.gameData.locations).filter(
            (e) => e.realm === realm && e.realmProgress === 'Late' && e.enemies,
        );
        return [
            earlyLocations[0].enemies!![0].enemy,
            middleLocations[0].enemies!![0].enemy,
            lateLocations[0].enemies!![0].enemy,
        ];
    };

    const getCurrentRealmIndex = () => {
        const currentRealm = player.realmOverride || player.realm;
        return realmProgression.indexOf(currentRealm as Realm);
    };

    const getNextRealm = (): Realm | null => {
        const currentIndex = getCurrentRealmIndex();
        if (currentIndex === -1 || currentIndex >= realmProgression.length - 1) {
            return null;
        }
        return realmProgression[currentIndex + 1];
    };

    const isPlayerMundane = () => {
        const currentRealm = player.realm;
        return currentRealm === 'mundane';
    };

    const handlePromote = () => {
        const nextRealm = getNextRealm();
        if (!nextRealm) return;

        const nextRealmName = realmDisplayNames[nextRealm] || nextRealm;

        // Create the full event with preamble, combat, and promotion handling
        const promotionEvent: GameEvent = {
            location: locationName,
            steps: [
                {
                    kind: 'text',
                    text: `As you approach the proving grounds, you see a sign that reads 'Promotion to ${nextRealmName}'. Entering it, you find yourself face-to-face with a dangerous collection of beasts. If you overcome them, you can earn yourself a promotion.`,
                },
                {
                    kind: 'combat',
                    enemies: getPromotionEnemies(nextRealm),
                    victory: [
                        {
                            kind: 'text',
                            text: 'Elation floods through you as the last of the beasts fall.',
                        },
                        {
                            kind: 'overridePlayerRealm',
                            realm: nextRealm,
                        },
                        {
                            kind: 'exit',
                        },
                    ],
                    defeat: [
                        {
                            kind: 'text',
                            text: 'You were defeated in the arena. You leave with your head hanging low.',
                        },
                        {
                            kind: 'exit',
                        },
                    ],
                },
            ]
        };

        // Start the event
        screenAPI.actions.startEvent(promotionEvent);
    };

    const createContent = () => {
        const currentRealm = player.realmOverride || player.realm;
        const nextRealm = getNextRealm();
        const currentRealmName = realmDisplayNames[currentRealm as Realm] || currentRealm;
        
        // Check if player is mundane
        if (!isPlayerMundane()) {
            return (
                <Box 
                    display="flex" 
                    flexDirection="column" 
                    alignItems="center" 
                    gap={3}
                    p={3}
                >
                    <Typography variant="h5" align="center">
                        Cultivation Proving Grounds
                    </Typography>
                    
                    <Typography variant="body1" align="center" color="error">
                        This proving ground is only available to those in the Mundane realm.
                    </Typography>
                    
                    <Typography variant="body2" align="center" color="text.secondary">
                        Your current realm: {currentRealmName}
                    </Typography>
                    
                    <Typography variant="body2" align="center" color="text.secondary">
                        Seek other methods of advancement suitable for your cultivation level.
                    </Typography>
                </Box>
            );
        }
        
        return (
            <Box 
                display="flex" 
                flexDirection="column" 
                alignItems="center" 
                gap={3}
                p={3}
            >
                <Typography variant="h5" align="center">
                    Cultivation Proving Grounds
                </Typography>
                
                <Typography variant="body1" align="center" color="text.secondary">
                    Here you can test your strength and advance your cultivation realm through combat trials.
                </Typography>

                <Box 
                    display="flex" 
                    flexDirection="column" 
                    alignItems="center" 
                    gap={2}
                    p={2}
                    sx={{ 
                        border: '1px solid', 
                        borderColor: 'divider', 
                        borderRadius: 2,
                        minWidth: 300
                    }}
                >
                    <Typography variant="h6">
                        Current Realm
                    </Typography>
                    <Typography variant="h4" color="primary">
                        {currentRealmName}
                    </Typography>

                    {nextRealm ? (
                        <>
                            <Typography variant="body2" color="text.secondary">
                                Next Realm: {realmDisplayNames[nextRealm] || nextRealm}
                            </Typography>
                            
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handlePromote}
                                sx={{ mt: 2, px: 4 }}
                            >
                                Attempt Promotion to {realmDisplayNames[nextRealm] || nextRealm}
                            </Button>
                            
                            <Typography variant="body2" align="center" color="text.secondary">
                                Face three challenging opponents to prove your worthiness for advancement.
                            </Typography>
                        </>
                    ) : (
                        <>
                            <Typography variant="h6" color="success.main">
                                Maximum Realm Achieved!
                            </Typography>
                            <Typography variant="body2" align="center" color="text.secondary">
                                You have reached the highest realm currently available in the proving grounds.
                            </Typography>
                        </>
                    )}
                </Box>
            </Box>
        );
    };

    console.log("Creating content")

    return <Box position="relative" flexGrow={1} display="flex" flexDirection="column">
      <BackgroundImage image={location.image} screenEffect={location.screenEffect} />
      <GameDialog title={'Proving Grounds'} onClose={() => screenAPI.actions.setScreen("location")} closeSfx="BuildingLeave">
        <Box flexGrow={1} display="flex" flexDirection="column" position="relative">
            {createContent()}
        </Box>
      </GameDialog>
      <Box
        position="absolute"
        width="100%"
        height="100%"
        display="flex"
        flexDirection="column"
        sx={{ pointerEvents: 'none' }}
      >
        <Box flexGrow={1} />
        <Box display="flex">
          <PlayerComponent />
        </Box>
      </Box>
    </Box>
}