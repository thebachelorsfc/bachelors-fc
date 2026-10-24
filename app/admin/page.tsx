import type { Metadata } from "next"; import AdminApp from "./AdminApp";
export const metadata: Metadata = { title: "Admin | The Bachelors FC", robots:{ index:false, follow:false } };
export default function Admin(){return(<main className="wrap"><section><p className="eyebrow">Club Admin</p><h1>Manage the club</h1><AdminApp/></section></main>)}
