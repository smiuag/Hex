import { useGameContextSelector } from "@/src/context/GameContext";
import { commonStyles } from "@/src/styles/commonStyles";
import { StarSystem } from "@/src/types/starSystemTypes";
import { totalShips } from "@/utils/shipUtils";
import { Text, TouchableOpacity, View } from "react-native";
import { CountdownTimer } from "./CountdownTimer";

type Props = {
  system: StarSystem;
};

export function FleetIncoming({ system }: Props) {
  const fleet = useGameContextSelector((ctx) => ctx.fleet);
  const cancelMovement = useGameContextSelector((ctx) => ctx.cancelMovement);
  const fleetIncoming = fleet.filter((f) => f.destinationSystemId == system.id);

  const onCancelMovement = (id: string) => {
    cancelMovement(id);
  };

  return fleetIncoming.map((f) => {
    const totalTime = f.endTime - f.startTime;
    const totalFleet = totalShips(f.ships);
    return (
      <View style={commonStyles.actionBar} key={f.id}>
        {f.movementType != "RETURN" ? (
          <>
            <Text style={commonStyles.statusTextYellow}>
              {totalFleet} naves llegan en{" "}
              <CountdownTimer duration={totalTime} startedAt={f.startTime}></CountdownTimer>
            </Text>
            <TouchableOpacity
              style={[commonStyles.cancelButton]}
              onPress={() => onCancelMovement(f.id)}
            >
              <Text style={commonStyles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={commonStyles.statusTextYellow}>
            {totalFleet} naves de regreso en{" "}
            <CountdownTimer duration={totalTime} startedAt={f.startTime}></CountdownTimer>
          </Text>
        )}
      </View>
    );
  });
}
