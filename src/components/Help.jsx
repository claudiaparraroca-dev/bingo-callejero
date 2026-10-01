import { CELL_POINTS, LINE_BONUS, FULL_BONUS } from '../lib/scoring'

export default function Help({ onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet help" onClick={e => e.stopPropagation()}>
        <h2>Cómo se juega 📸</h2>
        <ol>
          <li><strong>Cada día hay un cartón nuevo</strong> con 9 cosas que encontrar por la calle, el mismo para todo el mundo. Toca una casilla y haz la foto: un árbitro con IA comprueba que vale.</li>
          <li>
            <strong>Puntos:</strong> fácil +{CELL_POINTS[1]}, media +{CELL_POINTS[2]}, difícil +{CELL_POINTS[3]}.
            Cada línea +{LINE_BONUS} y el cartón completo (¡BINGO!) +{FULL_BONUS}.
          </li>
          <li><strong>⚡ Flash sorpresa:</strong> una vez al día, a una hora secreta, salta un reto rápido. Tienes 5 minutos y cuanto antes lo hagas, más puntos (de 100 a 50). Activa los avisos para no perdértelo.</li>
          <li><strong>Ranking mundial</strong> del día y de siempre.</li>
          <li><strong>Salas privadas:</strong> crea una con tus amigos, elige temática (naturaleza, arte urbano, bares…) y competid en vuestro propio ranking.</li>
        </ol>
        <p className="small">Tus fotos se guardan solo en tu móvil. Para validarlas se envían al árbitro y no se guardan en ningún servidor. No fotografíes a personas sin su permiso.</p>
        <button className="btn primary" onClick={onClose}>¡A jugar!</button>
      </div>
    </div>
  )
}
