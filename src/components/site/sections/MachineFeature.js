import MachineDetail from '../MachineDetail';
import { getMachineById, getMachines } from '@/lib/content';

export default async function MachineFeature({ data }) {
  let m = data.machineId ? await getMachineById(Number(data.machineId)) : null;
  if (!m) m = (await getMachines())[0] || null;
  if (!m) return null;
  // on the Power Press page only the gallery and features show; the intro and spec table are opt-in from the admin
  return <MachineDetail m={m} hideHero={!data.showHero} hideSpecs={!data.showSpecs} />;
}
