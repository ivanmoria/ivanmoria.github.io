document.addEventListener("DOMContentLoaded", () => {
    const days = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
    const startHour = 7;  // Início às 7h
    const endHour = 22;   // Término às 22h
  
    const tableBody = document.getElementById("schedule");
  
    // Gera as linhas de horários e células de cada dia da semana
    for (let hour = startHour; hour <= endHour; hour++) {
      const row = document.createElement("tr");
  
      // Cria a célula do horário
      const timeCell = document.createElement("td");
      timeCell.textContent = `${hour}:00`;
      row.appendChild(timeCell);
  
      // Cria as células editáveis para cada dia da semana
      days.forEach(day => {
        const cell = document.createElement("td");
        const textarea = document.createElement("textarea");
  
        // Define um ID único para cada célula, como "domingo-7", "segunda-8", etc.
        const cellId = `${day}-${hour}`;
        textarea.id = cellId;
  
        // Carrega o conteúdo salvo (se houver) do localStorage
        const savedTask = localStorage.getItem(cellId);
        if (savedTask) {
          textarea.value = savedTask;
        }
  
        cell.appendChild(textarea);
        row.appendChild(cell);
      });
  
      tableBody.appendChild(row);
    }
  
    // Função para salvar as tarefas no localStorage
    document.getElementById("save").addEventListener("click", () => {
      days.forEach(day => {
        for (let hour = startHour; hour <= endHour; hour++) {
          const cellId = `${day}-${hour}`;
          const task = document.getElementById(cellId).value;
          localStorage.setItem(cellId, task);
        }
      });
      alert("Tarefas salvas com sucesso!");
    });
  });

  
  document.addEventListener("DOMContentLoaded", () => {
    const days = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
    const startHour = 7;  // Início às 7h
    const endHour = 22;   // Término às 22h
  
    const tableBody = document.getElementById("schedule");
  
    // Gera as linhas de horários e células de cada dia da semana
    for (let hour = startHour; hour <= endHour; hour++) {
      const row = document.createElement("tr");
  
      // Cria a célula do horário
      const timeCell = document.createElement("td");
      timeCell.textContent = `${hour}:00`;
      row.appendChild(timeCell);
  
      // Cria as células editáveis para cada dia da semana
      days.forEach(day => {
        const cell = document.createElement("td");
        const textarea = document.createElement("textarea");
  
        // Define um ID único para cada célula, como "domingo-7", "segunda-8", etc.
        const cellId = `${day}-${hour}`;
        textarea.id = cellId;
  
        // Carrega o conteúdo salvo (se houver) do localStorage
        const savedTask = localStorage.getItem(cellId);
        if (savedTask) {
          textarea.value = savedTask;
        }
  
        cell.appendChild(textarea);
        row.appendChild(cell);
      });
  
      tableBody.appendChild(row);
    }
  
    // Função para salvar as tarefas no localStorage
    document.getElementById("save").addEventListener("click", () => {
      days.forEach(day => {
        for (let hour = startHour; hour <= endHour; hour++) {
          const cellId = `${day}-${hour}`;
          const task = document.getElementById(cellId).value;
          localStorage.setItem(cellId, task);
        }
      });
      alert("Tarefas salvas com sucesso!");
    });
  
    // Função para exportar a tabela em formato CSV
    document.getElementById("export").addEventListener("click", () => {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Horário," + days.join(",") + "\n"; // Cabeçalho
  
      for (let hour = startHour; hour <= endHour; hour++) {
        const timeSlot = `${hour}:00`;
        const row = [timeSlot]; // Adiciona a hora como primeira coluna
  
        // Adiciona os dados de cada dia
        days.forEach(day => {
          const cellId = `${day}-${hour}`;
          
          // Carrega o valor da célula da interface ou, se estiver vazia, do localStorage
          let task = document.getElementById(cellId).value || localStorage.getItem(cellId) || "";
          task = task.replace(/(\r\n|\n|\r)/gm, " "); // Remove quebras de linha
          row.push(`"${task}"`); // Usa aspas para valores com vírgulas
        });
  
        csvContent += row.join(",") + "\n"; // Junta os dados e adiciona à linha CSV
      }
  
      // Cria o link para download do CSV
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "planner_semanal.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  });
  