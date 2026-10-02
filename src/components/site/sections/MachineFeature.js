import MachineDetail from '../MachineDetail';
import { getMachineById, getMachines } from '@/lib/content';

export default async function MachineFeature({ data }) {
  let m = data.machineId ? await getMachineById(Number(data.machineId)) : null;
  if (!m) m = (await getMachines())[0] || null;
  if (!m) return null;
  return <MachineDetail m={m} />;
}
