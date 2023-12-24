async function obtenerHoraBuenosAires() {
  try {
    const response = await fetch('https://worldtimeapi.org/api/timezone/America/Argentina/Buenos_Aires');
    const data = await response.json();

    if (response.ok) {
      const hora = new Date(data.utc_datetime);
      return hora.toLocaleString('es-AR', { hour: 'numeric', minute: 'numeric', second: 'numeric' });
    } else {
      throw new Error('No se pudo obtener la hora de Buenos Aires.');
    }
  } catch (error) {
    console.error(error.message);
    return null;
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const horaActualElement = document.getElementById('horaActual');
  actualizarHoraActual(); // Llamar a la función una vez al inicio
  setInterval(actualizarHoraActual, 1000); // Configurar el intervalo de actualización (Puse 500 por que asi no me genera bugs)

  // Restaurar historial desde el Local Storage
  const historial = JSON.parse(localStorage.getItem('historial')) || [];
  actualizarHistorial(historial);

  document.getElementById('calcularBtn').addEventListener('click', function () {
    calcularPrecio();
  });

  document.getElementById('resetBtn').addEventListener('click', function () {
    guardarCompra();
  });

  document.getElementById('resetBtn').addEventListener('click', function () {
    resetearLocalStorage();
  });

  function actualizarHoraActual() {
    obtenerHoraBuenosAires().then(horaActual => {
      if (horaActual) {
        horaActualElement.textContent = `Hora actual: ${horaActual}`;
      } else {
        horaActualElement.textContent = 'No se pudo obtener la hora actual.';
      }
    });
  }

  function calcularPrecio() {
    //componentes
    const componentes = [
      { nombre: 'Procesador', precio: 100 },
      { nombre: 'Monitor', precio: 80 },
      { nombre: 'Memoria RAM', precio: 40 },
      { nombre: 'Gabinete', precio: 30 },
      { nombre: 'Fuente de Poder', precio: 40 },
      { nombre: 'HDD', precio: 30 },
      { nombre: 'SSD', precio: 50 },
      { nombre: 'SSD M.2', precio: 80 },
      { nombre: 'Tarjeta Gráfica', precio: 120 },
      { nombre: 'Cooler', precio: 20 },
      { nombre: 'Motherboard', precio: 80 },
    ];

    //valores seleccionados por el usuario
    const nombreUsuario = document.getElementById('nombreUsuario').value;
    const seleccionados = document.querySelectorAll('select');

    //guarda la información en el LocalStorage
    const compra = {
      nombreUsuario: nombreUsuario,
      componentes: [],
    };

    let totalSinIVA = 0;

    for (let i = 0; i < seleccionados.length; i++) {
      const componenteSeleccionado = {
        nombre: componentes[i].nombre,
        precio: parseFloat(seleccionados[i].value),
      };
      compra.componentes.push(componenteSeleccionado);
      totalSinIVA += componenteSeleccionado.precio;
    }

    // Guardar en el LocalStorage
    localStorage.setItem('compra', JSON.stringify(compra));

    // Calcular el total con IVA (21%)
    const iva = totalSinIVA * 0.21;
    const totalConIVA = totalSinIVA + iva;

    // Muestra SweetAlert
    Swal.fire({
      title: 'Resultado',
      html: `Total sin IVA: $${totalSinIVA.toFixed(2)}<br>IVA (21%): $${iva.toFixed(2)}<br>Total con IVA: $${totalConIVA.toFixed(2)}`,
      icon: 'success',
    })
    .then((result) => {
      // Muestra la segunda SweetAlert
      if (result.isConfirmed) {
        Swal.fire({
          title: '¡Muchas Gracias!',
          text: `Gracias, ${nombreUsuario}, por usar nuestros servicios de cálculos.`,
          icon: 'success',
        });
      }
    });

    // Actualizar historial después de guardar la compra
    actualizarHistorial(historial);
    guardarCompraEnHistorial(compra);
  }

  function guardarCompra() {
    // Función para guardar compra
  }
  function resetearLocalStorage() {
    // Elimina el historial del LocalStorage
    localStorage.removeItem('historial');

    // Actualiza la interfaz para reflejar el historial vacío
    actualizarHistorial([]);

    // Muestra SweetAlert
    Swal.fire({
      title: 'Historial Resetado',
      text: 'El historial de compras se ha reseteado completamente.',
      icon: 'info',
    });
  }

  function actualizarHistorial(historial) {
    const historialList = document.getElementById('historialList');
    historialList.innerHTML = '';

    historial.forEach(compra => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `<strong>${compra.nombreUsuario}</strong>: $${calcularTotalCompra(compra).toFixed(2)}`;
      historialList.appendChild(listItem);
    });
  }

  function calcularTotalCompra(compra) {
    let totalSinIVA = 0;
    compra.componentes.forEach(componente => {
      totalSinIVA += componente.precio;
    });
    const iva = totalSinIVA * 0.21;
    const totalConIVA = totalSinIVA + iva;
    return totalConIVA;
  }

  function guardarCompraEnHistorial(compra) {
    // Agregar la compra al historial
    historial.push(compra);

    // Si hay más de tres compras en el historial, eliminar las más antiguas
    if (historial.length > 3) {
      historial.splice(0, historial.length - 3);
    }

    // Guardar el historial en el Local Storage
    localStorage.setItem('historial', JSON.stringify(historial));

    // Actualizar el historial en la interfaz
    actualizarHistorial(historial);
  }
});
