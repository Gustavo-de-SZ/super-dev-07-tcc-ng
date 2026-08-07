import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validação algorítmica de CPF (Módulo 11)
 */
export function validarCPF(cpf: string | null | undefined): boolean {
  if (!cpf) return false;

  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;

  // Rejeita sequências repetidas (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(clean)) return false;

  // Validação do 1º Dígito
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(clean.charAt(9), 10)) return false;

  // Validação do 2º Dígito
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(clean.charAt(10), 10)) return false;

  return true;
}

/**
 * Validação algorítmica de CNPJ (Módulo 11)
 */
export function validarCNPJ(cnpj: string | null | undefined): boolean {
  if (!cnpj) return false;

  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14) return false;

  // Rejeita sequências repetidas (ex: 00.000.000/0000-00)
  if (/^(\d)\1{13}$/.test(clean)) return false;

  // Validação do 1º Dígito
  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let soma = 0;
  for (let i = 0; i < 12; i++) {
    soma += parseInt(clean.charAt(i), 10) * pesos1[i];
  }
  let resto = soma % 11;
  const digito1 = resto < 2 ? 0 : 11 - resto;
  if (digito1 !== parseInt(clean.charAt(12), 10)) return false;

  // Validação do 2º Dígito
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  soma = 0;
  for (let i = 0; i < 13; i++) {
    soma += parseInt(clean.charAt(i), 10) * pesos2[i];
  }
  resto = soma % 11;
  const digito2 = resto < 2 ? 0 : 11 - resto;
  if (digito2 !== parseInt(clean.charAt(13), 10)) return false;

  return true;
}

/**
 * Validador Angular Reactive Forms para CPF
 */
export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const val = control.value;
    if (!val) return null; // Vazio não é inválido se não for required

    const clean = String(val).replace(/\D/g, '');
    if (clean.length === 0) return null;

    if (clean.length !== 11) {
      return { invalidCPFLength: true };
    }

    if (!validarCPF(clean)) {
      return { invalidCPF: true };
    }

    return null;
  };
}

/**
 * Validador Angular Reactive Forms para CNPJ
 */
export function cnpjValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const val = control.value;
    if (!val) return null;

    const clean = String(val).replace(/\D/g, '');
    if (clean.length === 0) return null;

    if (clean.length !== 14) {
      return { invalidCNPJLength: true };
    }

    if (!validarCNPJ(clean)) {
      return { invalidCNPJ: true };
    }

    return null;
  };
}

/**
 * Validador Angular Reactive Forms para CPF ou CNPJ
 */
export function cpfOrCnpjValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const val = control.value;
    if (!val) return null;

    const clean = String(val).replace(/\D/g, '');
    if (clean.length === 0) return null;

    if (clean.length <= 11) {
      if (clean.length !== 11) return { invalidDocLength: true };
      return validarCPF(clean) ? null : { invalidCPF: true };
    } else {
      if (clean.length !== 14) return { invalidDocLength: true };
      return validarCNPJ(clean) ? null : { invalidCNPJ: true };
    }
  };
}
