function memberEditController($scope, $rootScope, $stateParams, $state, informService, membersService) {
	$scope.member = {};
	$scope.memberId = $stateParams.id;
	$scope.mentors = null;
	
	var phoneRegex = new RegExp('[0-9]{9}');
	var privateEmailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	var cardNumberRegex = new RegExp('[a-z0-9]{6}-[a-z0-9]{6}', 'i');
	
	$scope.types = [
	{id: 'C', name: 'Członek zwyczajny'},
	{id: 'Z', name: 'Zarząd'},
	{id: 'R', name: "Komisja Rewizyjna"},
	{id: 'K', name: 'Koordynator grupy roboczej'},
	{id: 'H', name: 'Członek honorowy'}];

	var validate = function(form) {
		if (form.$invalid) {
			informService.showAlert('Błąd', 'Wypełnij poprawnie formularz');
			return false;
		} else if (!phoneRegex.test($scope.member.phone)){
			informService.showAlert('Błąd', 'Numer telefonu jest niepoprawny');
			return false;		
		} else if (!privateEmailRegex.test($scope.member.privateEmail)){
			informService.showAlert('Błąd', 'Adres e-mail jest niepoprawny');
			return false;		
		}  else if (!cardNumberRegex.test($scope.member.cardNumber)){
			informService.showAlert('Błąd', 'Numer karty członkowskiej jest niepoprawny');
			return false;		
		} else {
			return true;
		}
	};

	var getMembersDetails = function() {
		membersService.getMemberDetails($scope.memberId)
		.success(function (data) {
			$scope.member = data;
			$scope.member.birthDate = new Date(data.birthDate);
			$scope.member.accessionDate = new Date(data.accessionDate);
		})
		.error(function () {
			informService.showSimpleToast('Błąd pobrania szczegółów członka');
		});
	};

	if (angular.isDefined($scope.memberId)) {
		getMembersDetails();
	}


	$scope.saveMember = function(form) {
		if (validate(form)) {
			if (angular.isUndefined($scope.member.id)) {
				membersService.saveMember($scope.member)
				.success(function () {
					informService.showSimpleToast('Zapisano nowego członka');
					$scope.member = null;
					getMentors();
					form.$setPristine();
					form.$setUntouched();
				})
				.error(function (data, status) {
					informService.showAlert('Błąd', 'Zapis nie powiódł się.');
					if (status === 401) {
						$rootScope.$emit('session.timeout', '');
					}
				});
			} else {
				membersService.changeMember($scope.member)
				.success(function () {
					informService.showSimpleToast('Zapisano zmiany w danych członka');
					$state.go('membersList');
				})
				.error(function (data, status) {
					informService.showAlert('Błąd', 'Zapis nie powiódł się.');
					if (status === 401) {
						$rootScope.$emit('session.timeout', '');
					}
				});
			}
		}
	};

	var getMentors = function() {
		membersService.getMentors()
		.success(function (data) {
			$scope.mentors = data;
		})
		.error(function (data, status) {
			informService.showSimpleToast('Błąd pobrania listy mentorów');
			if (status === 401) {
				$rootScope.$emit('session.timeout', '');
			}
		});
	};

	var init = function() {
		getMentors();
	};

	init();
};

app.component('memberEditForm', {
	templateUrl: 'include/member-edit-form.html',
	controller: memberEditController,
	bindings: {
		save: '&'
	}
});