export default function Help({ onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet help" onClick={e => e.stopPropagation()}>
        <h2>Cómo se juega 📸</h2>
        <ol>
          <li><strong>Cada día hay un cartón nuevo</strong> con 9 cosas que encontrar por la calle. Es el mismo para todo el mundo.</li>
          <li><strong>Toca una casilla y haz la foto.</strong> Un árbitro con IA comprueba que de verdad sale lo que pide.</li>
          <li><strong>Haz línea</strong> (fila, columna o diagonal) o completa el cartón para cantar <strong>¡BINGO!</strong></li>
          <li><strong>Comparte tu resultado</strong> sin spoilers y pica a tus amigos.</li>
        </ol>
        <p className="small">Tus fotos se guardan solo en tu móvil. Para validarlas se envían al árbitro y no se guardan en ningún servidor. No fotografíes a personas sin su permiso.</p>
        <button className="btn primary" onClick={onClose}>¡A jugar!</button>
      </div>
    </div>
  )
}
