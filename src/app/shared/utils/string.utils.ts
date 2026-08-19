export class StringUtils {
  /**
   * Converte uma string para Title Case (ex: "NOME DA EMPRESA S.A" -> "Nome da Empresa S.A")
   */
  static toTitleCase(str: string): string {
    if (!str) return '';
    return str.toLowerCase().split(' ').map((word, index, arr) => {
      // Mantém as preposições curtas em minúsculo, exceto se for a primeira palavra
      const smallWords = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'na', 'no', 'nas', 'nos'];
      if (smallWords.includes(word) && index !== 0) {
        return word;
      }
      // Trata hífens ou caracteres especiais se precisar, mas o básico é:
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  }
}
