export const pt_BR = {
  invalidURL: 'URL inválida',
  exception: {
    invalidCustomField: (fieldName) => `O campo "${fieldName}" é inválido ou nulo`,
    badRequest: 'Solicitação inválida',
    unauthorized: 'Não autorizado',
    forbidden: 'Acesso proibido',
    notFound: 'Recurso não encontrado ou removido',
    methodNotAllowed: 'Método não permitido',
    conflict: 'Conflito de dados',
    unprocessableEntity: 'Entidade não processável',
    internalServerError: 'Ocorreu um erro interno',
    notImplemented: 'Funcionalidade não implementada',
    serviceUnavailable: 'Serviço indisponível',
    conflictEntityAlreadyExists: 'Entidade já cadastrada',
  },
  account: {
    invalidName: 'Nome informado é muito curto ou não foi considerado válido',
    invalidUsername: 'Username informado é muito curto ou não foi considerado válido',
    invalidEmail: 'Endereço de e-mail não foi considerado válido',
    invalidPassword: 'Senha informada é muito fraca',

    usernameExist: 'Já existe um usuário com o username informado',
    emailExist: 'Já existe um usuário com o e-mail informado',

    notFound: 'Usuário não encontrado',
    unauthorized: 'Credenciais não reconhecidas',
    disabledOrLocked: 'Conta não ativa ou bloqueada',
    newEmailBeDifferent: 'Novo e-mail precisa ser diferente do atual',
    newPasswordBeDifferent: 'Nova senha precisa ser diferente da atual',
    insufficientPermissions:
      'Não autorizado. Você não tem permissão para acessar o recurso solicitado',
    invalidAuthority: 'Autoridade não reconhecida',
  },
  social: {
    invalidIdentifer: 'Identificador inválido ou nulo',
    invalidDetails: 'Detalhes não pode ser muito grande',
  },
  stack: {
    slugOrNameNotSent: 'Informe o nome ou slug da entidade',
    slugAlreadyExists:
      'Não foi possível salvar, pois há uma entidade com slug parecido. Dê outro nome para a Stack',
    invalidName: 'A Stack precisa ter um nome válido',
  },
}
