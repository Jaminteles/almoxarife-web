import { useParams } from "react-router-dom";
import ServicoForm from "./ServicoForm";
export default function Edit() { const { id } = useParams(); return <ServicoForm id={id} />; }
